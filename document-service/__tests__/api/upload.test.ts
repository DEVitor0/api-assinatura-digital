import request from "supertest";
import app from "../../src/server";
import path from "path";
import fs from "fs";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Rota: POST /api/documents/upload", () => {
  let token: string;
  const testFilePath = path.resolve(__dirname, "../files/test.pdf");

  beforeAll(() => {
    token = "Bearer fake-token";

    mockedAxios.post.mockResolvedValue({
      data: {
        valid: true,
        user: {
          id: "507f1f77bcf86cd799439011",
          role: "user",
          email: "teste@email.com",
          name: "Usuário Teste",
        },
      },
    });

    if (!fs.existsSync(testFilePath)) {
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      fs.writeFileSync(testFilePath, "%PDF-1.4\n%fake-pdf");
    }
  });

  it("deve retornar 401 se não tiver token", async () => {
    const res = await request(app)
      .post("/api/documents/upload")
      .attach("document", testFilePath);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Token não fornecido.");
  });

  it("deve retornar 400 se o arquivo não for enviado", async () => {
    const res = await request(app)
      .post("/api/documents/upload")
      .set("Authorization", token);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Arquivo não enviado.");
  });

  it("deve retornar 200 e os dados do arquivo se o upload der certo", async () => {
    const res = await request(app)
      .post("/api/documents/upload")
      .set("Authorization", token)
      .attach("document", testFilePath);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Upload realizado com sucesso.");
    expect(res.body.file).toHaveProperty("originalName");
    expect(res.body.file).toHaveProperty("storedName");
    expect(res.body.file).toHaveProperty("size");
    expect(res.body.file).toHaveProperty("path");
  });

  it("deve rejeitar arquivos com extensões diferentes de .pdf", async () => {
    const fakeTxtPath = path.resolve(__dirname, "../files/test.txt");
    fs.writeFileSync(fakeTxtPath, "conteúdo inválido");

    const res = await request(app)
      .post("/api/documents/upload")
      .set("Authorization", token)
      .attach("document", fakeTxtPath);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Apenas arquivos PDF são permitidos.");
  });
});
