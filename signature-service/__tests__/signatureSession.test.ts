import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import dayjs from "dayjs";

// 1) MOCK REDIS antes de importar o cliente
const mockRedisSet = jest.fn().mockResolvedValue("OK");
jest.mock("../src/redis/client", () => ({
  __esModule: true,
  default: {
    set: mockRedisSet,
  },
}));

import RedisClient from "../src/redis/client";

// 2) MOCK MONGOOSE model
const mockCreate = jest.fn();
jest.mock("../src/models/SignatureSession", () => ({
  __esModule: true,
  default: {
    create: mockCreate,
  },
}));

import SignatureSession from "../src/models/SignatureSession";
import { createSignatureSession } from "../src/services/signatureSession.service";

describe("createSignatureSession", () => {
  const mockDocumentId = "document123";
  const mockSigners = ["user1", "user2"];
  const mockCreatedBy = "creatorId";
  const mockSessionId = "session-abc";
  const mockExpiresAt = dayjs().add(30, "minute").toDate();

  // objeto mínimo que satisfaça o retorno de SignatureSession.create()
  const mockSessionData = {
    _id: mockSessionId,
    documentId: mockDocumentId,
    signers: mockSigners.map((u) => ({ userId: u, status: "pending" })),
    createdBy: mockCreatedBy,
    expiresAt: mockExpiresAt,
    status: "active",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisSet.mockResolvedValue("OK");
  });

  it("deve criar sessão com TTL padrão (30 min) e salvar no Redis", async () => {
    mockCreate.mockResolvedValue(mockSessionData);

    const session = await createSignatureSession({
      documentId: mockDocumentId,
      signers: mockSigners,
      createdBy: mockCreatedBy,
    });

    // chamou o model com os dados esperados
    expect(mockCreate).toHaveBeenCalledWith({
      documentId: mockDocumentId,
      createdBy: mockCreatedBy,
      signers: [
        { userId: "user1" },
        { userId: "user2" },
      ],
      expiresAt: expect.any(Date),
    });

    // salvou no redis com TTL de 1800s
    expect(mockRedisSet).toHaveBeenCalledWith(
      `session:${mockSessionId}`,
      "active",
      "EX",
      1800
    );

    // retornou exatamente o que o mock devolveu
    expect(session).toEqual(mockSessionData);
  });

  it("deve usar TTL customizado quando fornecido", async () => {
    mockCreate.mockResolvedValue(mockSessionData);

    await createSignatureSession({
      documentId: mockDocumentId,
      signers: mockSigners,
      createdBy: mockCreatedBy,
      ttlMinutes: 10,
    });

    expect(mockRedisSet).toHaveBeenCalledWith(
      `session:${mockSessionId}`,
      "active",
      "EX",
      600
    );
  });

  it("deve falhar se o MongoDB lançar erro", async () => {
    const err = new Error("MongoDB Failure");
    mockCreate.mockRejectedValue(err);

    await expect(
      createSignatureSession({
        documentId: mockDocumentId,
        signers: mockSigners,
        createdBy: mockCreatedBy,
      })
    ).rejects.toThrow("MongoDB Failure");
  });

  it("deve falhar se o Redis lançar erro", async () => {
    mockCreate.mockResolvedValue(mockSessionData);
    const err = new Error("Redis Failure");
    mockRedisSet.mockRejectedValue(err);

    await expect(
      createSignatureSession({
        documentId: mockDocumentId,
        signers: mockSigners,
        createdBy: mockCreatedBy,
      })
    ).rejects.toThrow("Redis Failure");
  });
});
