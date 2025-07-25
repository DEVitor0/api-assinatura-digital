import jwt, { Secret, SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

const secret: Secret = process.env.SIGNATURE_TOKEN_SECRET!;
const expiresIn: StringValue = (process.env.SIGNATURE_TOKEN_EXPIRES_IN || "10m") as StringValue;

export interface SignatureTokenPayload {
  userId: string;
  documentId: string;
  sessionId: string;
  type: "signature";
}

export function generateSignatureToken(payload: SignatureTokenPayload): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, options);
}

export function verifySignatureToken(token: string): SignatureTokenPayload {
  return jwt.verify(token, secret) as SignatureTokenPayload;
}
