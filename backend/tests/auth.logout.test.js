import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('POST /auth/logout', () => {
  it('invalidates the current session', async () => {
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

    const logoutResponse = await agent
      .post('/auth/logout')

    expect(logoutResponse.status).toBe(200)

    const meResponse = await agent
      .get('/auth/me')

    expect(meResponse.status).toBe(401)
  })
})
