import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable("discord_profiles")
		.addColumn("id", "varchar", (col) => col.primaryKey().notNull())
		.addColumn("discord_user_id", "varchar", (col) => col.notNull())
		.addColumn("discord_username", "varchar", (col) => col.notNull())
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`NOW()`).notNull(),
		)
		.addColumn("updated_at", "timestamptz")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("discord_profiles").execute();
}
