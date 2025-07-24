import SignatureSession from "../models/SignatureSession";
import RedisClient from "../redis/client";
import dayjs from "dayjs";
import { verifyUserExists } from './auth.service';

export async function createSignatureSession(data: {
  documentId: string;
  signers: string[];
  createdBy: string;
  ttlMinutes?: number;
}) {
  const { documentId, signers, createdBy, ttlMinutes = 30 } = data;
  const session = await SignatureSession.create({
    documentId,
    createdBy,
    signers: signers.map((id) => ({ userId: id })),
    expiresAt: dayjs().add(ttlMinutes, "minute").toDate(),
  });
  await RedisClient.set(`session:${session._id}`, "active", "EX", ttlMinutes * 60);
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