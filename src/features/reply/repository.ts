import { Result } from 'true-myth'
import { db } from '../database'
import type { Reply } from '@/types'
import { sql } from 'kysely'

namespace Repository {
  export type Error = 'ERR_UNEXPECTED'

  export const createReply = async (
    payload: Reply.Insertable
  ): Promise<Result<Reply.Selectable, Error>> => {
    try {
      const reply = await db
        .insertInto('replies')
        .values(payload)
        .returningAll()
        .executeTakeFirstOrThrow()
      return Result.ok(reply)
    } catch (error) {
      console.error('Error creating reply:', error)
      return Result.err('ERR_UNEXPECTED')
    }
  }

  export const findReplyByid = async (
    id: string
  ): Promise<Result<Reply.Selectable | null, Error>> => {
    try {
      const reply = await db
        .selectFrom('replies')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst()
      return Result.ok(reply ?? null)
    } catch (error) {
      console.error('Error finding reply by id:', error)
      return Result.err('ERR_UNEXPECTED')
    }
  }

  export type FindByDiscordProfileIdAndDayPayload = {
    discord_profile_id: string
    day: Date
  }

  export const findReplyByDiscordProfileIdAndDay = async (
    payload: FindByDiscordProfileIdAndDayPayload
  ): Promise<Result<Reply.Selectable | null, Error>> => {
    try {
      const reply = await db
        .selectFrom('replies')
        .where('discord_profile_id', '=', payload.discord_profile_id)
        .where(
          sql`DATE("created_at")`,
          '=',
          sql`DATE(${payload.day.toISOString()})`
        )
        .selectAll()
        .executeTakeFirst()
      return Result.ok(reply ?? null)
    } catch (error) {
      console.error('Error finding reply by Discord profile ID and day:', error)
      return Result.err('ERR_UNEXPECTED')
    }
  }

  export const getAllReplies = async () => {
    try {
      const replies = await db.selectFrom('replies').selectAll().execute()
      return Result.ok(replies)
    } catch (err) {
      console.error('Error getting all replies:', err)
      return Result.err('ERR_UNEXPECTED')
    }
  }
}

export default Repository
