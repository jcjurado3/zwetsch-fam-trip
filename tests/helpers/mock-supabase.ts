import { vi } from "vitest";

export type QueryResult = {
  data: unknown;
  error: { message: string; code?: string } | null;
  count?: number | null;
};

/**
 * Builds a thenable Supabase query-builder mock so
 * `await client.from(...).select()...` and `.single()` both work.
 */
export function createQueryBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};

  for (const method of [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "like",
    "not",
    "in",
    "order",
    "limit",
  ] as const) {
    builder[method] = vi.fn(() => builder);
  }

  builder.single = vi.fn(async () => result);
  builder.then = (
    onFulfilled?: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(onFulfilled, onRejected);

  return builder;
}

/**
 * Map table name → result. Use `table#2` for the second call to the same table.
 */
export function createTableMock(resultsByTable: Record<string, QueryResult>) {
  const callCount: Record<string, number> = {};

  return {
    from: vi.fn((table: string) => {
      callCount[table] = (callCount[table] ?? 0) + 1;
      const indexed = `${table}#${callCount[table]}`;
      const result =
        resultsByTable[indexed] ??
        resultsByTable[table] ?? { data: [], error: null };
      return createQueryBuilder(result);
    }),
  };
}
