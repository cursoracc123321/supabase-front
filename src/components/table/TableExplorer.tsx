import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { describeTable, fetchRows, listTables } from "../../api/database";
import type { TableSchema } from "../../api/database";
import { Loader } from "../common/Loader";
import { ErrorBanner } from "../common/ErrorBanner";

interface TableExplorerState {
  tables: TableSchema[];
  activeTable: string | null;
  loading: boolean;
  error: string | null;
  rows: Record<string, unknown>[] | null;
  columns: TableSchema["columns"];
}

const INITIAL_STATE: TableExplorerState = {
  tables: [],
  activeTable: null,
  loading: true,
  error: null,
  rows: null,
  columns: [],
};

export const TableExplorer = () => {
  const [state, setState] = useState<TableExplorerState>(INITIAL_STATE);
  const [limit, setLimit] = useState(25);

  const loadTables = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const tables = await listTables();
      setState((prev) => ({
        ...prev,
        tables,
        activeTable: tables[0]?.name ?? null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load tables",
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const loadTableData = async (tableName: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [schema, rowsResult] = await Promise.all([
        describeTable(tableName),
        fetchRows(tableName, [], { limit, orderBy: { column: "id", ascending: true } }),
      ]);

      if (rowsResult.error) {
        throw rowsResult.error;
      }

      setState((prev) => ({
        ...prev,
        activeTable: tableName,
        columns: schema.columns,
        rows: rowsResult.data,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load table data",
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    void loadTables();
  }, []);

  useEffect(() => {
    if (state.activeTable) {
      void loadTableData(state.activeTable);
    }
    // We intentionally skip dependencies to avoid re-running when state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeTable, limit]);

  const tableOptions = useMemo(
    () =>
      state.tables.map((table) => (
        <option key={table.name} value={table.name}>
          {table.name}
        </option>
      )),
    [state.tables],
  );

  return (
    <section
      style={{
        background: "white",
        padding: "1.5rem",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(15, 23, 42, 0.1)",
        marginBottom: "2rem",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <label style={{ display: "flex", flexDirection: "column", fontSize: "0.875rem" }}>
            <span style={{ marginBottom: "0.25rem", fontWeight: 600 }}>Table</span>
            <select
              value={state.activeTable ?? ""}
              onChange={(event) => {
                const tableName = event.target.value;
                if (tableName) {
                  void loadTableData(tableName);
                }
              }}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5f5",
                minWidth: "180px",
              }}
            >
              {tableOptions}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", fontSize: "0.875rem" }}>
            <span style={{ marginBottom: "0.25rem", fontWeight: 600 }}>Limit</span>
            <input
              type="number"
              value={limit}
              min={1}
              max={200}
              onChange={(event) => setLimit(Number(event.target.value))}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5f5",
                width: "80px",
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => state.activeTable && loadTableData(state.activeTable)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: "#0f172a",
              color: "white",
            }}
          >
            Refresh
          </button>
        </div>
      </header>

      {state.error ? (
        <ErrorBanner message={state.error} onRetry={loadTables} />
      ) : null}

      {state.loading ? (
        <Loader />
      ) : state.rows && state.rows.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {state.columns.map((column) => (
                  <th
                    key={column.name}
                    className={clsx("table-header")}
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600 }}>{column.name}</span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{column.type}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${state.activeTable}`}>
                  {state.columns.map((column) => (
                    <td
                      key={column.name}
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.875rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatCellValue(row[column.name])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: "#64748b" }}>No data found for this table.</p>
      )}
    </section>
  );
};

const formatCellValue = (value: unknown) => {
  if (value === null || typeof value === "undefined") {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

