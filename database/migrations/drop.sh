#!/bin/bash
set -e
cd "$(dirname "$0")"
source ../db_env.sh

psql "$PG_CONNECTION_STRING" -f drop_all.psql >/dev/null