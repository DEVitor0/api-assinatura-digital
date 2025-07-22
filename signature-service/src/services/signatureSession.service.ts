import SignatureSession from "../models/SignatureSession";
import RedisClient from "../redis/client";
import dayjs from "dayjs";

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
    signers: signers.map((id) => ({
      userId: id,
    })),
    expiresAt: dayjs().add(ttlMinutes, "minute").toDate(),
  });

  const redisKey = `session:${session._id}`;
  await RedisClient.set(redisKey, "active", "EX", ttlMinutes * 60);

  return session;
}
