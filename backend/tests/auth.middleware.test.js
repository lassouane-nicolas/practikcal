import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('Authentication middleware', () => {
  it('returns 401 when accessing a protected route without a session', async () => {
    const response = await request(app)
      .get('/goals/current')

    expect(response.status).toBe(401)
  })
})
