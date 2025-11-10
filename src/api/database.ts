import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseClient } from "../lib/supabaseClient";
import type { FilterClause, QueryOptions } from "../types/database";
import { applyFilters, applyQueryOptions } from "../utils/queryBuilders";

const supabase = () => getSupabaseClient();

export interface TableSchema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    isNullable: boolean;
    defaultValue: unknown;
  }>;
}

export interface QueryResult<T = Record<string, unknown>> {
  data: T[] | null;
  error: PostgrestError | null;
  count?: number | null;
}

export const listTables = async (): Promise<TableSchema[]> => {
  const { data, error } = await supabase()
    .from("pg_catalog.pg_tables")
    .select("schemaname, tablename")
    .in("schemaname", ["public"]);

  if (error) {
    throw error;
  }

  return (data ?? []).map((table) => ({
    name: table.tablename as string,
    columns: [],
  }));
};

export const describeTable = async (tableName: string): Promise<TableSchema> => {
  const { data, error } = await supabase()
    .from("information_schema.columns")
    .select("column_name, data_type, is_nullable, column_default")
    .eq("table_name", tableName)
    .order("ordinal_position", { ascending: true });

  if (error) {
    throw error;
  }

  return {
    name: tableName,
    columns: (data ?? []).map((column) => ({
      name: column.column_name as string,
      type: column.data_type as string,
      isNullable: column.is_nullable === "YES",
      defaultValue: column.column_default,
    })),
  };
};

export const fetchRows = async <T = Record<string, unknown>>(
  tableName: string,
  filters: FilterClause[] = [],
  options: QueryOptions = {},
): Promise<QueryResult<T>> => {
  let query = supabase().from<T>(tableName).select(options.columns?.join(",") ?? "*", {
    count: options.count ? "exact" : undefined,
  });

  query = applyFilters(query, filters);
  query = applyQueryOptions(query, options);

  const { data, error, count } = await query;

  return { data, error, count };
};

export const insertRow = async <T extends Record<string, unknown>>(
  tableName: string,
  payload: T,
): Promise<QueryResult<T>> => {
  const { data, error } = await supabase().from<T>(tableName).insert(payload).select();
  return { data, error };
};

export const updateRow = async <T extends Record<string, unknown>>(
  tableName: string,
  payload: Partial<T>,
  filters: FilterClause[],
): Promise<QueryResult<T>> => {
  let query = supabase().from<T>(tableName).update(payload).select();
  query = applyFilters(query, filters);
  const { data, error } = await query;
  return { data, error };
};

export const deleteRows = async (
  tableName: string,
  filters: FilterClause[],
): Promise<QueryResult> => {
  let query = supabase().from(tableName).delete().select();
  query = applyFilters(query, filters);
  const { data, error } = await query;
  return { data, error };
};

