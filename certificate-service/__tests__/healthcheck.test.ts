import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from '../src/app';

describe('GET /healthcheck', () => {
  it('should return 200 OK with status message', async () => {
    const response = await request(app).get('/healthcheck');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Service is running',
      timestamp: expect.any(String)
    });
  });
});