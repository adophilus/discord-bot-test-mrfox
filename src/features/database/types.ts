import type { ColumnType } from 'kysely'

type TimestampModel = {
  created_at: ColumnType<string, never, never>
  updated_at: ColumnType<string, never, string>
}

type DiscordProfilesTable = TimestampModel & {
  id: string
  discord_user_id: string
  discord_username: string
}

type RepliesTable = TimestampModel & {
  id: string
  count: number
  discord_profile_id: string
}

type PromptsTable = TimestampModel & {
  id: string
  discord_channel_id: string
  discord_message_id: string
  sent_at: string
}

export type Database = {
  replies: RepliesTable
  discord_profiles: DiscordProfilesTable
  prompts: PromptsTable
}
