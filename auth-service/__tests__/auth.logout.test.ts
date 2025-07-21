import request from 'supertest';
import app from "../src/server"; 
import { RefreshToken } from "../src/models/RefreshToken";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import mongoose from 'mongoose';

describe('POST /api/auth/logout', () => {
  let token: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI as string);
    }

    const newToken = await RefreshToken.create({
      userId: new mongoose.Types.ObjectId(),
      token: 'fake_token_123456',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 dias no futuro
    });
    

    token = newToken.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('deve retornar 400 se refreshToken não for enviado', async () => {
    const res = await request(app).post('/api/auth/logout').send({});
    expect(res.status).toBe(400);
  });

  it('deve retornar 204 e revogar o token', async () => {
    const res = await request(app).post('/api/auth/logout').send({ refreshToken: token });
    expect(res.status).toBe(204);
  });

  it('deve retornar 404 se o token já foi revogado', async () => {
    const res = await request(app).post('/api/auth/logout').send({ refreshToken: token });
    expect(res.status).toBe(404);
  });
});
