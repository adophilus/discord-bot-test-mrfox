import { Result } from 'true-myth'
import { db } from '../database'
import type { DiscordProfile } from '@/types'

namespace Repository {
  export type Error = 'ERR_UNEXPECTED'

  export type CreateProfilePayload = DiscordProfile.Insertable

  export const createProfile = async (
    payload: CreateProfilePayload
  ): Promise<Result<DiscordProfile.Selectable, Error>> => {
    try {
      const createdProfile = await db
        .insertInto('discord_profiles')
        .values(payload)
        .returningAll()
        .executeTakeFirstOrThrow()
      return Result.ok(createdProfile)
    } catch (error) {
      console.error('Error creating Discord profile:', error)
      return Result.err('ERR_UNEXPECTED')
    }
  }

  export const findProfileByDiscordUserId = async (
    id: string
  ): Promise<Result<DiscordProfile.Selectable | null, Error>> => {
    try {
      const reply = await db
        .selectFrom('discord_profiles')
        .where('discord_user_id', '=', id)
        .selectAll()
        .executeTakeFirst()
      return Result.ok(reply ?? null)
    } catch (error) {
      console.error('Error finding reply by id:', error)
      return Result.err('ERR_UNEXPECTED')
    }
  }

  export const getAllProfiles = async () => {
    try {
      const profiles = await db
        .selectFrom('discord_profiles')
        .selectAll()
        .execute()
      return Result.ok(profiles)
    } catch (err) {
      console.error('Error getting all profiles:', err)
      return Result.err('ERR_UNEXPECTED')
    }
  }
}

export default Repository
