import { useCallback, useState } from "react";
import { fetchRows } from "../../api/database";
import type { FilterClause } from "../../types/database";
import { Loader } from "../common/Loader";
import { ErrorBanner } from "../common/ErrorBanner";

interface FilterDraft extends FilterClause {
  id: string;
}

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const defaultFilter = (): FilterDraft => ({
  id: createId(),
  column: "",
  operator: "eq",
  value: "",
});

export const QueryRunner = () => {
  const [tableName, setTableName] = useState("");
  const [filters, setFilters] = useState<FilterDraft[]>([defaultFilter()]);
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runQuery = useCallback(async () => {
    if (!tableName) {
      setError("Please provide a table name.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const normalizedFilters = filters
        .filter((filter) => filter.column && filter.value !== "")
        .map<FilterClause>((filter) => ({
          column: filter.column,
          operator: filter.operator,
          value: filter.operator === "in" ? String(filter.value).split(",") : filter.value,
        }));

      const result = await fetchRows(tableName, normalizedFilters);
      if (result.error) {
        setError(result.error.message);
      }
      setRows(result.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run query");
    } finally {
      setLoading(false);
    }
  }, [tableName, filters]);

  const updateFilter = (id: string, patch: Partial<FilterDraft>) => {
    setFilters((current) =>
      current.map((filter) => (filter.id === id ? { ...filter, ...patch } : filter)),
    );
  };

  const addFilter = () => setFilters((current) => [...current, defaultFilter()]);

  const removeFilter = (id: string) =>
    setFilters((current) => current.filter((filter) => filter.id !== id));

  return (
    <section
      style={{
        background: "white",
        padding: "1.5rem",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(15, 23, 42, 0.1)",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Query Runner</h2>
      {error ? <ErrorBanner message={error} /> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Table name</span>
          <input
            type="text"
            placeholder="public.my_table"
            value={tableName}
            onChange={(event) => setTableName(event.target.value)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5f5",
            }}
          />
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Filters</span>
          {filters.map((filter) => (
            <div
              key={filter.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 2fr auto",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Column"
                value={filter.column}
                onChange={(event) => updateFilter(filter.id, { column: event.target.value })}
                style={inputStyle}
              />
              <select
                value={filter.operator}
                onChange={(event) =>
                  updateFilter(filter.id, { operator: event.target.value as FilterDraft["operator"] })
                }
                style={inputStyle}
              >
                {filterOperators.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Value"
                value={filter.value as string}
                onChange={(event) => updateFilter(filter.id, { value: event.target.value })}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeFilter(filter.id)}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ef4444",
                  background: "transparent",
                  color: "#ef4444",
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFilter}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px dashed #0f172a",
              background: "transparent",
              color: "#0f172a",
              width: "fit-content",
            }}
          >
            + Add filter
          </button>
        </div>
        <button
          type="button"
          onClick={runQuery}
          disabled={loading}
          style={{
            padding: "0.75rem 1rem",
            background: "#0f172a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            width: "fit-content",
          }}
        >
          {loading ? "Running…" : "Run query"}
        </button>
      </div>

      <section style={{ marginTop: "1.5rem" }}>
        {loading ? (
          <Loader />
        ) : rows && rows.length > 0 ? (
          <pre
            style={{
              background: "#0f172a",
              color: "#f8fafc",
              padding: "1rem",
              borderRadius: "12px",
              maxHeight: "260px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(rows, null, 2)}
          </pre>
        ) : (
          <p style={{ color: "#64748b" }}>Query results will appear here.</p>
        )}
      </section>
    </section>
  );
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid #cbd5f5",
};

const filterOperators: FilterDraft["operator"][] = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "is",
  "in",
];

