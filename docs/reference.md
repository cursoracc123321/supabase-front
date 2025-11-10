# Supabase Front – Documentation

This document explains every exported API, function, store, and component made available by the Supabase Front project. It includes setup guidance, descriptions, and example usage to help you integrate the frontend quickly.

## Project Setup

### Install Dependencies

```bash
pnpm install
# or
npm install
```

### Configure Environment

Create a `.env.local` file in the project root with your Supabase credentials. Vite exposes any variable prefixed with `VITE_`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Run Locally

```bash
pnpm dev
# Visit http://localhost:5173
```

### Build for Production

```bash
pnpm build
pnpm preview    # optional smoke-test of the production bundle
```

---

## Library & Utilities

### `src/lib/supabaseClient.ts`

#### `getSupabaseClient(options?: SupabaseClientOptions): SupabaseClient`

Returns a memoized Supabase client configured with Vite env variables. Throws if the URL or anon key is missing.

**Example**

```
```src/lib/supabaseClient.ts
export const getSupabaseClient = (options: SupabaseClientOptions = {}): SupabaseClient => {
  // ... existing code ...
};
```
```

```ts
import { getSupabaseClient } from "../lib/supabaseClient";

const supabase = getSupabaseClient();
const { data } = await supabase.from("profiles").select("*");
```

#### `ensureSupabaseClient(options?: SupabaseClientOptions): Promise<SupabaseClient>`

Async helper that resolves the shared client—handy when an async API is required.

```ts
await ensureSupabaseClient();
```

---

### `src/utils/queryBuilders.ts`

Helpers for composing Postgrest queries.

#### `applyFilters(query, filters)`

Applies an array of `FilterClause` items to a Postgrest query chain.

```
```src/utils/queryBuilders.ts
export const applyFilters = <T>(query: FilterableQuery<T>, filters: FilterClause[]) => {
  // ... existing code ...
};
```
```

```ts
const result = await fetchRows("messages", [
  { column: "created_at", operator: "gte", value: "2025-01-01" },
]);
```

#### `applyQueryOptions(query, options)`

Honors `orderBy`, `limit`, and `offset` options when building a query.

---

## API Layer

### `src/api/auth.ts`

Encapsulates Supabase Auth flows.

| Function | Description |
| --- | --- |
| `signInWithPassword(credentials)` | Email/password login. |
| `signUpWithPassword({ email, password, metadata })` | Registers a new user; metadata stored as `user.user_metadata`. |
| `signOut()` | Ends the current session. |
| `getCurrentSession()` | Returns cached session if available. |
| `getCurrentUser()` | Returns the current user or `null`. |

**Usage**

```ts
import { signInWithPassword, signOut } from "../api/auth";

const { error } = await signInWithPassword({ email, password });
if (!error) {
  // user is now signed in
}

await signOut();
```

### `src/api/database.ts`

Abstractions over Supabase table operations.

| Function | Purpose | Example |
| --- | --- | --- |
| `listTables()` | Lists public schema tables. | `const tables = await listTables();` |
| `describeTable(tableName)` | Returns column metadata. | `await describeTable("profiles");` |
| `fetchRows(tableName, filters?, options?)` | Retrieves rows with optional filters and pagination. | `await fetchRows("profiles", [{ column: "city", operator: "eq", value: "Berlin" }], { limit: 10 });` |
| `insertRow(tableName, payload)` | Inserts a record. | `await insertRow("profiles", { name: "Ada" });` |
| `updateRow(tableName, payload, filters)` | Updates rows matching filters. | `await updateRow("profiles", { city: "Paris" }, [{ column: "id", operator: "eq", value: userId }]);` |
| `deleteRows(tableName, filters)` | Deletes rows matching filters. | `await deleteRows("logs", [{ column: "level", operator: "eq", value: "debug" }]);` |

All APIs return `{ data, error, count? }`, mirroring Supabase response objects.

---

## State Management

### `src/state/authStore.ts`

Zustand store controlling authentication state.

| Field | Type | Description |
| --- | --- | --- |
| `user` | `User \| null` | Active Supabase user. |
| `session` | `Session \| null` | Current session payload. |
| `loading` | `boolean` | Indicates whether auth guard is resolving. |

| Action | Signature | Description |
| --- | --- | --- |
| `setUser(user)` | `(user: User \| null) => void` | Writes user to the store. |
| `setSession(session)` | `(session: Session \| null) => void` | Writes session to the store. |
| `setLoading(bool)` | `(loading: boolean) => void` | Manages splash screen state. |
| `reset()` | `() => void` | Clears session and user. |

```ts
import { useAuthStore } from "../state/authStore";

const user = useAuthStore((state) => state.user);
```

---

## Components

All components are located under `src/components`.

### Auth Components

#### `AuthProvider`

Wraps children with Supabase auth initialisation. Loads the current session and subscribes to auth state changes. Shows `Loader` while initializing.

Usage in `src/App.tsx`:

```
```src/App.tsx
export const App = () => (
  <AuthProvider>
    {/* children */}
  </AuthProvider>
);
```
```

#### `AuthGate`

Renders either the `AuthForm` or its children depending on the signed-in state.

- `AuthGate` (default export): Protects sections of the UI.
- `AuthGate.HeaderActions`: Renders user email and sign-out button for the top bar.

```tsx
import { AuthGate } from "../components/auth/AuthGate";

<AuthGate>
  <ProtectedArea />
</AuthGate>;
```

#### `AuthForm`

Email/password sign-in & sign-up form with inline error reporting. Exports no additional props; stateful within the component.

### Layout Components

#### `AppShell`

Provides the overall layout: header, sign-out area, and content wrapper. Accepts a single prop `main` (`React.ReactNode`) rendered inside an authenticated area.

```tsx
<AppShell main={<Dashboard />} />;
```

### Common Components

#### `Loader`

Minimal loading indicator used during auth bootstrap and long-running queries.

#### `ErrorBanner`

Styled error panel with optional retry button.

```tsx
<ErrorBanner message="Something went wrong" onRetry={retryFn} />
```

### Table & Data Components

#### `TableExplorer`

Displays available public tables, schema metadata, and the first page of rows. Allows changing the result limit and refreshing data.

- Automatically loads tables on mount.
- Selecting a table loads metadata + rows using `describeTable` and `fetchRows`.
- Adjust the `Limit` input to control pagination size (default 25).

```
```src/components/table/TableExplorer.tsx
export const TableExplorer = () => {
  // ... existing code ...
};
```
```

#### `QueryRunner`

Ad-hoc query builder for quick data exploration.

- Enter a table name (e.g., `profiles`).
- Add one or more filters (column, operator, value).
- Runs `fetchRows` and displays JSON results.

Supports the filter operators defined in `FilterClause` (eq, neq, gt, gte, lt, lte, like, ilike, is, in).

---

## Example: Building a Profile Dashboard

```tsx
import { useEffect, useState } from "react";
import { fetchRows } from "./api/database";

export const ProfileDashboard = () => {
  const [profiles, setProfiles] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetchRows("profiles", [], { limit: 50 }).then((result) => {
      if (!result.error && result.data) {
        setProfiles(result.data);
      }
    });
  }, []);

  return (
    <ul>
      {profiles.map((profile) => (
        <li key={profile.id as string}>{profile.email as string}</li>
      ))}
    </ul>
  );
};
```

Wrap this dashboard with `AuthGate` or nest it within `AppShell` to reuse the authenticated layout.

---

## Testing Checklist

- Supabase credentials defined in `.env.local`.
- Ability to sign up and sign in via email/password.
- `TableExplorer` lists public tables and displays rows.
- `QueryRunner` can filter results across various operators.

---

## Extending the Frontend

1. **Add Custom Views**: Create components that leverage `fetchRows`, `insertRow`, etc., to build CRUD workflows tailored to specific tables.
2. **Realtime Updates**: Use Supabase's `channel` API with `getSupabaseClient()` for real-time subscriptions.
3. **Theming**: Replace inline styles with Tailwind, CSS Modules, or any design system of your choice.
4. **Access Control**: Wrap routes with `AuthGate` to ensure only authenticated users interact with the database.

This documentation will remain accurate as long as the exported interfaces stay aligned with the tables and components described above. Update this document whenever you add or modify public APIs.

