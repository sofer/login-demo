import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { registerRoutes } from '../routes';

describe('Authentication API', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    registerRoutes(app);
  });

  it('returns 401 when not authenticated', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
    });

    it('sends magic link for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('returns 400 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .query({ token: 'invalid-token' });

      expect(response.status).toBe(400);
    });
  });
});