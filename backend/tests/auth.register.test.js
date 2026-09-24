import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

const { default: pool } = await import('../src/config/database.js')

describe('POST /auth/register', () => {
  it('creates a user with valid data', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@practikcal.fr',
        password: 'Password123!'
      })

    const result = await pool.query(
      'SELECT email, password_hash FROM app_user WHERE email = $1',
      ['test@practikcal.fr']
    )

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].email).toBe('test@practikcal.fr')
    expect(result.rows[0].password_hash).not.toBe('Password123!')

    expect(response.status).toBe(201)
  })

  it('returns 400 when required data is missing', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@practikcal.fr'
      })

    expect(response.status).toBe(400)
  })

  it('returns 409 when email is already used', async () => {
    const userData = {
      email: 'test@practikcal.fr',
      password: 'Password123!'
    }

    await request(app)
      .post('/auth/register')
      .send(userData)

    const response = await request(app)
      .post('/auth/register')
      .send(userData)

    expect(response.status).toBe(409)
  })
})
