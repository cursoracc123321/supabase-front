import type { FilterableQuery, FilterClause, QueryOptions } from "../types/database";

export const applyFilters = <T>(
  query: FilterableQuery<T>,
  filters: FilterClause[],
): FilterableQuery<T> => {
  return filters.reduce((acc, filter) => {
    switch (filter.operator) {
      case "eq":
      case "neq":
      case "gt":
      case "gte":
      case "lt":
      case "lte":
      case "like":
      case "ilike":
      case "is":
        return acc[filter.operator](filter.column, filter.value);
      case "in":
        return acc.in(filter.column, filter.value as string[] | number[]);
      default:
        return acc;
    }
  }, query);
};

export const applyQueryOptions = <T>(
  query: FilterableQuery<T>,
  options: QueryOptions,
): FilterableQuery<T> => {
  let nextQuery = query;

  if (options.orderBy) {
    nextQuery = nextQuery.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  if (typeof options.limit === "number") {
    nextQuery = nextQuery.limit(options.limit);
  }

  if (typeof options.offset === "number" && typeof options.limit === "number") {
    nextQuery = nextQuery.range(options.offset, options.offset + options.limit - 1);
  } else if (typeof options.offset === "number") {
    nextQuery = nextQuery.range(options.offset, options.offset + 50);
  }

  return nextQuery;
};

