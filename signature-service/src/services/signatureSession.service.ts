import SignatureSession from "../models/SignatureSession";
import RedisClient from "./redis/client";
import dayjs from "dayjs";
import { verifyUserExists } from './auth.service';
import {
  signatureSessionsCreated,
  signatureSessionDuration,
  updateActiveSessionsGauge,
} from "../metrics/metrics";

export async function createSignatureSession(data: {
  documentId: string;
  signers: string[];
  createdBy: string;
  ttlMinutes?: number;
}) {
  const end = signatureSessionDuration.startTimer(); 

  const { documentId, signers, createdBy, ttlMinutes = 30 } = data;

  const session = await SignatureSession.create({
    documentId,
    createdBy,
    signers: signers.map((id) => ({ userId: id })),
    expiresAt: dayjs().add(ttlMinutes, "minute").toDate(),
  });

  await RedisClient.set(`session:${session._id}`, "active", "EX", ttlMinutes * 60);

  signatureSessionsCreated.inc(); 
  end();

  updateActiveSessionsGauge(); 

  return session;
}

export async function addSigner(documentId: string, userId: string) {
  await verifyUserExists(userId);
  const exists = await SignatureSession.findOne({ documentId, "signers.userId": userId });
  if (exists) throw new Error("User already a signer for this document");
  return SignatureSession.updateOne(
    { documentId },
    { $push: { signers: { userId, status: "pending" } } }
  );
}

export async function listSigners(documentId: string) {
  const session = await SignatureSession.findOne({ documentId });
  if (!session) throw new Error("Session not found");
  return session.signers;
}

export async function removeSigner(documentId: string, userId: string) {
  return SignatureSession.updateOne(
    { documentId },
    { $pull: { signers: { userId } } }
  );
}

export async function isSessionActive(sessionId: string): Promise<boolean> {
  const result = await RedisClient.get(`session:${sessionId}`);
  return result === "active";
}

export async function expireSession(sessionId: string) {
  await RedisClient.del(`session:${sessionId}`);
}

export async function getSessionTTL(sessionId: string): Promise<number | null> {
  const ttl = await RedisClient.ttl(`session:${sessionId}`);
  return ttl >= 0 ? ttl : null;
}

export const findSessionByDocumentId = async (documentId: string) => {
  return await SignatureSession.findOne({ documentId });
};