import { generateSignatureToken, verifySignatureToken } from "../../src/utils/jwt";
import { describe, it, expect } from "@jest/globals";

process.env.SIGNATURE_TOKEN_SECRET = "test_secret";
process.env.SIGNATURE_TOKEN_EXPIRES_IN = "10m";

describe("JWT Token exclusivo por signatário", () => {
  const payload = {
    userId: "user123",
    documentId: "doc456",
    sessionId: "sess789",
    type: "signature" as const,
  };

  it("deve gerar um token JWT válido e verificável", () => {
    const token = generateSignatureToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("deve decodificar o token corretamente com os dados do signatário", () => {
    const token = generateSignatureToken(payload);
    const decoded = verifySignatureToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.documentId).toBe(payload.documentId);
    expect(decoded.sessionId).toBe(payload.sessionId);
    expect(decoded.type).toBe("signature");
  });
});
