# Sourced by migrations/*.sh and seeds/*.sh (not run directly).
# Builds PG_CONNECTION_STRING for the LOCAL docker Postgres from
# database/.env (see .env.example). It always points at localhost on
# purpose — drop.sh wipes the schema, so these scripts must never reach
# a remote (Aiven) database by accident.

set -a
source "$(dirname "${BASH_SOURCE[0]}")/.env"
set +a

PG_CONNECTION_STRING="postgresql://postgres:${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in database/.env}@localhost:${POSTGRES_PORT:-5433}/granola"
