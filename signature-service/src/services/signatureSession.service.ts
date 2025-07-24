import SignatureSession from "../models/SignatureSession";
import { verificarUsuarioExiste } from "./auth.service";
import RedisClient from "../redis/client";
import dayjs from "dayjs";

export const adicionarSignatario = async (documentId: string, userId: string) => {
  await verificarUsuarioExiste(userId);

  const existe = await SignatureSession.findOne({ documentId, userId });
  if (existe) {
    throw new Error("Usuário já é signatário deste documento");
  }

  const novaSessao = await SignatureSession.create({ documentId, userId });
  return novaSessao;
};

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
