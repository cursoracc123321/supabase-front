import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";

export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "is"
  | "in";

export interface FilterClause {
  column: string;
  operator: FilterOperator;
  value: string | number | boolean | null | string[] | number[];
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  columns?: string[];
  count?: boolean;
}

export type FilterableQuery<T> = PostgrestFilterBuilder<T>;

