#!/bin/bash
set -e
cd "$(dirname "$0")/migrations";
echo "Dropping"
./drop.sh;
echo "Migrating"
./migrate.sh;
cd ../seeds;
echo "Seeding"
./seed.sh