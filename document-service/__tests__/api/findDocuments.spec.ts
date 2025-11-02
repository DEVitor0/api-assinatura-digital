import request from "supertest";
import app from "../../src/server"; 
import mongoose from "mongoose";
import { Document } from "../../src/models/Document";
import jwt from "jsonwebtoken";

const userId = new mongoose.Types.ObjectId();
const token = jwt.sign(
  { id: userId.toString(), email: "test@example.com", name: "Test User", role: "user" },
  process.env.JWT_SECRET || "defaultsecret"
);

let documentoId: string;

beforeAll(async () => {
  const doc: Document = await Document.create({
    originalName: "teste.pdf",
    storedName: "stored_teste.pdf",
    mimeType: "application/pdf",
    hash: "1234567890abcdef",
    uploadedBy: userId,
  });
  
  documentoId = doc._id.toString();
});

afterAll(async () => {
  await Document.deleteMany({ uploadedBy: userId });
  await mongoose.connection.close();
});

describe("Rotas de Documentos", () => {
  it("deve listar os documentos do usuário logado", async () => {
    const res = await request(app)
      .get("/api/documents")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("deve retornar um documento por ID", async () => {
    const res = await request(app)
      .get(`/api/documents/${documentoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", documentoId);
  });

  it("deve retornar erro ao buscar por ID inválido", async () => {
    const res = await request(app)
      .get("/api/documents/123")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "ID inválido.");
  });

  it("deve deletar um documento do usuário", async () => {
    const res = await request(app)
      .delete(`/api/documents/${documentoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Documento deletado com sucesso.");
  });

  it("deve retornar erro ao deletar documento inexistente", async () => {
    const res = await request(app)
      .delete(`/api/documents/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});
