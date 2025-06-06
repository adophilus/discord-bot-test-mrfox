import { config } from '../config'
import { TablePrefixPlugin, IndexPrefixPlugin } from 'kysely-plugin-prefix'
import type { Database as TDatabase } from './types.ts'
import { Database } from 'bun:sqlite'
import { Kysely } from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-sqlite'

const database = new Database(config.db.url, { strict: true })
database.exec('PRAGMA journal_mode = WAL;')

const dialect = new BunSqliteDialect({
  database
})

export const options = {
  dialect,
  plugins: [
    new TablePrefixPlugin({ prefix: config.db.prefix ?? '' }),
    new IndexPrefixPlugin({ prefix: config.db.prefix ?? '' })
  ]
}

export const db = new Kysely<TDatabase>(options)
