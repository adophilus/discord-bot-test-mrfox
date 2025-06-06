import { config } from "@/features/config";
import { TablePrefixPlugin, IndexPrefixPlugin } from "kysely-plugin-prefix";
import type { Database } from "./types.ts";
import { Kysely, PostgresDialect } from "kysely";

import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
	connectionString: config.db.url,
});

const dialect = new PostgresDialect({
	pool,
});

export const db = new Kysely<Database>({
	dialect,
	plugins: [
		new TablePrefixPlugin({ prefix: config.db.prefix ?? "" }),
		new IndexPrefixPlugin({ prefix: config.db.prefix ?? "" }),
	],
});
