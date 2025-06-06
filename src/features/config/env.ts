import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: '',
  client: {},
  server: {
    NODE_ENV: z.enum(['production', 'staging', 'development', 'test']),
    // DATABASE_URL: z.string().url(),
    DATABASE_URL: z.string(),
    DATABASE_PREFIX: z.string().optional(),
    DISCORD_BOT_TOKEN: z.string().optional()
  },
  /**
   * Makes sure you explicitly access **all** environment variables
   * from `server` and `client` in your `runtimeEnv`.
   */
  runtimeEnv: process.env
})
