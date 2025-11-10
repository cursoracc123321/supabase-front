# Supabase Front

Supabase Front is a lightweight React + Vite frontend for exploring and managing your Supabase database from desktop or mobile devices. It ships with authentication, table browsing, and an ad-hoc query builder out of the box.

## Highlights

- 🔐 Email/password auth with Supabase Auth
- 📊 Table explorer with schema metadata and pagination controls
- 🔎 Visual query runner that supports all common PostgREST operators
- ⚙️ Modular API layer and Zustand store for easy extension

## Getting Started

```bash
pnpm install           # or npm / yarn
cp .env.example .env.local  # define Supabase credentials here
pnpm dev               # visit http://localhost:5173
```

> The app expects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.

## Documentation

Full API and component reference is available at `docs/reference.md`. It covers:

- Supabase client helpers
- Auth and database APIs
- Zustand state store
- Components (Auth, Layout, Table Explorer, Query Runner)
- Usage examples and extension ideas

## Scripts

```bash
pnpm dev      # Start Vite dev server
pnpm build    # Production build
pnpm preview  # Preview production build locally
pnpm lint     # Run ESLint
```

## License

MIT © 2025

