import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('GET /', () => {
  it('returns the API health message', async () => {
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.text).toBe('PractiKcal API is running')
  })
})
