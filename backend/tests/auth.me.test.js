import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('GET /auth/me', () => {
  it('returns 401 without a valid session', async () => {
    const response = await request(app)
      .get('/auth/me')

    expect(response.status).toBe(401)
  })

  it('returns the authenticated user with a valid session', async () => {
    const agent = request.agent(app)

    await agent
      .post('/auth/register')
      .send({
        email: 'test@practikcal.fr',
        password: 'Password123!'
      })

    await agent
      .post('/auth/login')
      .send({
        email: 'test@practikcal.fr',
        password: 'Password123!'
      })

    const response = await agent
      .get('/auth/me')

    expect(response.status).toBe(200)
    expect(response.body.user.email).toBe('test@practikcal.fr')
  })
})
