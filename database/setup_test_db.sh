#!/bin/bash
# Creates/refreshes the granola_test database used by `npm run test:integration`
# (backend-frontend). Targets the local docker Postgres from docker-compose.yml.
set -e

# Load POSTGRES_PASSWORD from database/.env (see database/.env.example)
set -a
source "$(dirname "$0")/.env"
set +a

LOCAL="postgresql://postgres:${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in database/.env}@localhost:5432"

psql "$LOCAL/postgres" -c "DROP DATABASE IF EXISTS granola_test" > /dev/null
psql "$LOCAL/postgres" -c "CREATE DATABASE granola_test" > /dev/null

cd "$(dirname "$0")/migrations"
for f in create_user_table.psql create_category_table.psql create_expense_table.psql create_expense_view.psql; do
  psql "$LOCAL/granola_test" -f "$f" > /dev/null
done

echo "granola_test ready"
