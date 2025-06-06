import { defineConfig } from "kysely-ctl";
import { TablePrefixPlugin, IndexPrefixPlugin } from "kysely-plugin-prefix";
import { config } from "./src/features/config";
import { PostgresDialect } from "kysely";

import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.db.url,
});

export const dialect = new PostgresDialect({
  pool,
});

export default defineConfig({
  dialect,
  plugins: [
    new TablePrefixPlugin({ prefix: config.db.prefix ?? "" }),
    new IndexPrefixPlugin({ prefix: config.db.prefix ?? "" }),
  ],
});
