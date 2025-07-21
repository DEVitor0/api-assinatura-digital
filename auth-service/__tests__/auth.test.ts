import request from "supertest";
import "jest";
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/server"; 
import User from "../src/models/User";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("POST /api/auth/register", () => {
  it("should register a user with valid data", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Vitor Moreira",
        email: "vitor@example.com",
        password: "senhaSegura123"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Usuário criado");
    expect(res.body).toHaveProperty("id");
  });

  it("should return 400 for invalid data", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "V",
        email: "invalid-email",
        password: "123" 
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 409 if email already exists", async () => {
    await User.create({
      name: "Existing User",
      email: "exist@example.com",
      password: "hashedpassword"
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "New User",
        email: "exist@example.com",
        password: "senhaSegura123"
      });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("error", "E-mail já cadastrado");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash("senhaSegura123", 10);
    await User.create({
      name: "Vitor Moreira",
      email: "vitor@example.com",
      password: hashedPassword,
      role: "user"
    });
  });

  it("should login successfully with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "vitor@example.com",
        password: "senhaSegura123"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  it("should return 404 if email does not exist", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "noexist@example.com",
        password: "senhaSegura123"
      });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Usuário não encontrado");
  });

  it("should return 401 if password is incorrect", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "vitor@example.com",
        password: "senhaErrada"
      });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Credenciais inválidas");
  });
});
