import request from "supertest";
import express from "express";
import documentsRouter from "../../src/pages/api/documents/index";
import { describe, it, expect, jest } from "@jest/globals";

// mock do middleware para sempre passar
jest.mock("../../src/middlewares/authenticate", () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { name: "Vitor" };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/api/documents", documentsRouter);

describe("Rota: /api/documents", () => {
  it("retorna mensagem de autenticação bem-sucedida", async () => {
    const res = await request(app).get("/api/documents");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Olá Vitor, você está autenticado!");
  });
});
