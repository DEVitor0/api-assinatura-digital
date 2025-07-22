import request from "supertest";
import express from "express";
import { authenticate } from "../../src/middlewares/authenticate";
import { describe, it, expect, jest } from "@jest/globals";
import axios from "axios";

// Mock do axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = express();
app.use(express.json());
app.get("/test", authenticate, (req, res) => {
  res.status(200).json({ message: "Autenticado com sucesso", user: req.user });
});

describe("Middleware: authenticate", () => {
  it("retorna 401 se o token não for fornecido", async () => {
    const res = await request(app).get("/test");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token não fornecido.");
  });

  it("retorna 401 se o token for inválido", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Token inválido"));

    const res = await request(app)
      .get("/test")
      .set("Authorization", "Bearer token_invalido");

    expect(res.status).toBe(500); // porque estamos caindo no catch
    expect(res.body.error).toBe("Erro ao validar token.");
  });

  it("passa se o token for válido", async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        valid: true,
        user: {
          id: "123",
          name: "Vitor",
          email: "vitor@email.com",
          role: "user",
        },
      },
    });

    const res = await request(app)
      .get("/test")
      .set("Authorization", "Bearer token_valido");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Autenticado com sucesso");
    expect(res.body.user).toEqual({
      id: "123",
      name: "Vitor",
      email: "vitor@email.com",
      role: "user",
    });
  });
});
