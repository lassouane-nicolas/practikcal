import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('POST /auth/login', () => {
  it('returns 200 with valid credentials', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        email: 'test@practikcal.fr',
        password: 'Password123!'
      })

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@practikcal.fr',
        password: 'Password123!'
      })

    expect(response.status).toBe(200)
  })

  it('returns 401 with invalid credentials', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        email: 'test@practikcal.fr',
        password: 'Password123!'
      })

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@practikcal.fr',
        password: 'WrongPassword123!'
      })

    expect(response.status).toBe(401)
  })
})
