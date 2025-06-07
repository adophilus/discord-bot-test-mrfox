import { sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('prompts')
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('discord_channel_id', 'text', (col) => col.notNull())
    .addColumn('discord_message_id', 'text', (col) => col.notNull())
    .addColumn('sent_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('prompts').execute()
}
