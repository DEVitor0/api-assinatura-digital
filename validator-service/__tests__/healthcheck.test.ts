import request from 'supertest';
import app from '../src/app';
import { describe, it, expect } from '@jest/globals';

describe('GET /api/validator/healthcheck', () => {
  it('deve retornar status ok', async () => {
    const response = await request(app).get('/api/validator/healthcheck');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'validator-service');
  });
});
