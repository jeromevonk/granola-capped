# Granola (capped)

Have a look at [the original repo](https://github.com/jeromevonk/granola).

## Possible future improvements

### Performance
- **Split `AppContext`** into `ScreenContext`, `CategoriesContext`, `VisibilityContext`, and `SearchFocusContext`. Currently all consumers re-render on any change (e.g. window resize triggers re-renders for components that only care about categories). Touches ~11 files.
- **Hoist remaining inline `sx` objects** in `ExpensesTable.js` (toolbar, popovers, cells) and other components to module-scope constants so they keep stable identity across renders.
- **Lazy-load `ReportTable`** via `next/dynamic` on the report page (smaller win than `EvolutionChart`, but still keeps the table out of the shared chunk).
- **Profile the 2.8s metadata API latency** — add timing logs around the Knex query, verify indexes are used (`EXPLAIN ANALYZE`), and check Aiven SSL handshake time vs. query time.
- **Audit remaining MUI barrel imports** (`import { Box, Container, ... } from '@mui/material'`) — mostly handled by `optimizePackageImports` in prod builds, but converting to direct imports (`import Box from '@mui/material/Box'`) removes any residual cost and is consistent with the rest of the codebase.
- **Virtualize `ExpensesTable`** (e.g. `@tanstack/react-virtual`) if expense counts grow large — pagination is in place today, but virtualization would eliminate DOM cost regardless of page size.

### Developer experience & tooling
- **Add TypeScript** — project is JS-only today; migrating incrementally (rename `.js` → `.tsx`, add `tsconfig.json`) would catch prop/shape bugs surfaced by the recent refactors.
- **Add a test suite** — no tests currently. Start with Vitest + React Testing Library for components and a handful of API-route integration tests against a local Postgres.
- **Set up CI** (GitHub Actions) to run `next build`, lint, and tests on every PR.
- **Add Prettier** with a pre-commit hook (Husky + lint-staged) for consistent formatting.
- **Dockerize local development** — a `docker-compose.yml` with Postgres + app service would remove the "is my local DB running?" class of problems and make onboarding trivial.
- **Pin remaining `latest` / caret-only deps** to exact versions. `package.json` was partially cleaned up, but caret ranges (`^`) on transitive-heavy libs (`next`, `@mui/x-date-pickers`, `react`) still allow silent version drift.

### Architecture & features
- **Migrate to the App Router** (`app/` directory) — enables React Server Components, streaming, and better data-fetching patterns. Large effort but aligned with Next.js 15's direction.
- **Replace `react-google-charts`** with a bundle-friendlier alternative (Recharts, Visx, or ECharts) — `react-google-charts` loads Google's hosted JS at runtime, which adds a network round-trip and can't be bundled/cached.
- **Add request-level caching** for category and year lists (React Query / SWR) — these barely change and are refetched on every navigation today.
- **Introduce a shared API client with error handling** — current `services/*` duplicate fetch + error paths. Consolidate into a single wrapper with retry, auth-refresh, and typed responses.
- **Add Sentry (or similar)** for error tracking in production — currently errors only surface via `alertService` toasts.
