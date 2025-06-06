import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import pg from 'pg'
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider
} from 'kysely'
import { run } from 'kysely-migration-cli'
import { db } from '@/features/database'

const migrationFolder = new URL('../migrations', import.meta.url).pathname

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder
  })
})

run(db, migrator, migrationFolder)
