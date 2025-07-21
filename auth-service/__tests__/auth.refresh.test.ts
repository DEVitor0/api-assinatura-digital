import dotenv from "dotenv";
dotenv.config({ path: ".env.test", override: true });

import request from "supertest";
import app from "../src/server"; 
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { RefreshToken } from "../src/models/RefreshToken";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

describe("POST /api/auth/refresh", () => {
  let userId: string;
  let validRefreshToken: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI as string);
    }

    userId = new mongoose.Types.ObjectId().toHexString();

    validRefreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    await RefreshToken.create({
      userId: new mongoose.Types.ObjectId(userId),
      token: validRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }, 15000);

  afterAll(async () => {
    await RefreshToken.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    await mongoose.disconnect();
  });

  it("should return 400 if refreshToken is missing", async () => {
    const res = await request(app).post("/api/auth/refresh").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Refresh token is required.");
  });

  it("should return 401 if refreshToken is invalid", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ refreshToken: "invalidtoken" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired refresh token.");
  });

  it("should return 200 and new tokens for valid refreshToken", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ refreshToken: validRefreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(typeof res.body.accessToken).toBe("string");
    expect(typeof res.body.refreshToken).toBe("string");
  });
});
