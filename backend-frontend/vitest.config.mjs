import { defineConfig, configDefaults } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    // mirror jsconfig.json baseUrl so 'src/...' imports resolve
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    // integration tests need a local Postgres — see vitest.integration.config.mjs
    exclude: [...configDefaults.exclude, '**/*.integration.test.js'],
  },
});
