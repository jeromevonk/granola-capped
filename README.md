# Granola (capped)

Personal/family expense tracker. Have a look at [the original repo](https://github.com/jeromevonk/granola).

**Stack**: Next.js 16 (Pages Router) · React 18 · MUI 5 · TanStack Query 5 · Knex/PostgreSQL (Aiven) · Vercel

## Development

```bash
cd backend-frontend
npm install
npm run dev                # http://localhost:3000
npm test                   # unit tests (Vitest)
npm run test:integration   # repo tests against local Postgres (below)
npm run lint
```

Local Postgres: `database/docker-compose.yml` + `database/migrate_and_seed.sh`.
Integration tests use a separate `granola_test` database — create it once with
`database/setup_test_db.sh`.


## Modernization (July 2026)

Guided by a full technical audit. Done so far:

- **Server-state caching with TanStack Query** (`src/hooks/queries.js`) — data
  is fetched once and survives navigation; mutations invalidate explicitly.
  Stale-while-revalidate defaults (5-min staleTime + refetch on window focus)
  keep a phone tab in sync with changes made on desktop.
- **Security/integrity**: expenses now validate category ownership (with a
  Vitest regression test); in-memory rate limiting on login.
- **Dark mode** — follows system preference, toggle in the app bar, persisted.
- **Latency diagnosed**: the old ~2.8s "metadata API" latency was cold
  connection setup (TCP+TLS+SCRAM ≈ 3s), not queries (13.7ms server-side).
  Root cause: Vercel functions in us-west-2 vs. Aiven in NYC (~75ms RTT).
  Fixed `pool.min: 0`; **action**: keep Vercel Function Region on `iad1`.
- Single source of truth for the expense API contract (`EXPENSE_COLUMNS`) and
  for the expense view-model (`src/helpers/expense-mapper.js`).
- Expense form survives a page reload (data now lives in the real URL).

## Remaining roadmap

### Phase 3 — structural refactoring
- Split `ExpensesTable.js` (859 lines) into toolbar/filters + a
  `useExpenseTableShortcuts` hook — this also clears the remaining 11
  pre-existing `react-hooks` lint errors.
- Incremental TypeScript, starting with the expense/category/stats shapes.
- Expand the test suite: pure logic first (`validate.js`,
  `chart-data-manipulation.js`), then API routes against local Postgres
  (December→January recurring copy is the tricky case), then `ExpenseForm`.

### Phase 4 — UX & features
- Inline search on mobile; a usable Report fallback on small screens.
- Keyboard-shortcut discovery overlay (`?`).
- Budget per category (reuses the existing report queries).
- Reminder for recurring expenses not yet copied to the current month.
- Replace `react-google-charts` with a bundleable alternative (it loads
  Google-hosted JS at runtime and doesn't follow the MUI theme).

### Phase 5 — AI (only where it removes real friction)
- Category suggestion from the user's own expense history.
- Natural-language search translated to the existing stats/expenses params.

### Minor / opportunistic
- Prettier + pre-commit hook; pin caret-ranged deps; Sentry (or similar);
  lazy-load `ReportTable`; virtualize `ExpensesTable` if data grows;
  App Router migration (large, optional).
