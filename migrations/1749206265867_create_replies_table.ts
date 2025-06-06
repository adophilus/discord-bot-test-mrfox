import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('replies')
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('count', 'integer', (col) => col.notNull())
    .addColumn('discord_profile_id', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'text')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('replies').execute()
}
