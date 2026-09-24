import dotenv from 'dotenv'
import { beforeEach } from 'vitest'

dotenv.config({
  path: '.env.test',
  override: true
})

const { default: pool } = await import('../src/config/database.js')

beforeEach(async () => {
  await pool.query(`
    TRUNCATE TABLE
      session,
      nutrition_goal,
      app_user
    RESTART IDENTITY CASCADE
  `)
})
