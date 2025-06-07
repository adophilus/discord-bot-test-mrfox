import { ulid } from 'ulidx'
import { db } from '../database'
import { sql } from 'kysely'
import type { Prompt } from '@/types'
import { Result, type Unit } from 'true-myth'

namespace Repository {
  type Error = 'ERR_UNEXPECTED'

  export type CreatePromptPayload = Prompt.Insertable

  export async function createPrompt(
    payload: CreatePromptPayload
  ): Promise<Result<Prompt.Selectable, Error>> {
    try {
      const prompt = await db
        .insertInto('prompts')
        .values(payload)
        .returningAll()
        .executeTakeFirstOrThrow()

      return Result.ok(prompt)
    } catch (error) {
      console.error('Error creating prompt:', error)
      return Result.err('ERR_UNEXPECTED')
    }
  }

  export async function findByMessageId(
    messageId: string
  ): Promise<Result<Prompt.Selectable | null, Error>> {
    try {
      const prompt = await db
        .selectFrom('prompts')
        .selectAll()
        .where('discord_message_id', '=', messageId)
        .executeTakeFirst()

      return Result.ok(prompt ?? null)
    } catch (error) {
      console.error('Error finding prompt by message ID:', error)
      return Result.err('ERR_UNEXPECTED')
    }
  }

  export async function deleteOlderThan(
    days: number
  ): Promise<Result<Unit, Error>> {
    try {
      await db
        .deleteFrom('prompts')
        .where('sent_at', '<', sql`DATE('now', '-${days} days')`)
        .execute()
      return Result.ok()
    } catch (error) {
      console.error('Error deleting prompts older than', days, 'days:', error)
      return Result.err('ERR_UNEXPECTED')
    }
  }
}

export default Repository
