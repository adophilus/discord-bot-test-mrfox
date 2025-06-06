import { env } from '../env'

const DatabaseConfig = {
  url: env.DATABASE_URL,
  prefix: env.DATABASE_PREFIX
}

export default DatabaseConfig
