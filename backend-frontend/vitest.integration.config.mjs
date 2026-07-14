import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Integration tests run against the local granola_test database
// (see database/setup_test_db.sh). The connection string is pinned to
// localhost on purpose — never point this at a remote database.
export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.integration.test.js'],
    fileParallelism: false,
    env: {
      PG_CONNECTION_STRING: 'postgresql://postgres:my_postgresql_password@localhost:5432/granola_test',
    },
  },
});
