import { Request, Response } from "express";
import { createSignatureSession } from "../services/signatureSession.service";
import * as signatureService from "../services/signatureSession.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "user" | "signer";
  };
}


export const adicionarSignatario = async (req: Request, res: Response) => {
  try {
    const { documentId, userId } = req.body;
    const sessao = await signatureService.adicionarSignatario(documentId, userId);
    res.status(201).json(sessao);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
};

export async function createSessionHandler(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const { documentId, signers, ttlMinutes } = authReq.body;

    if (!documentId || !Array.isArray(signers) || signers.length === 0) {
      return res.status(400).json({ message: "Dados inválidos." });
    }

    if (!authReq.user) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    const session = await createSignatureSession({
      documentId,
      signers,
      createdBy: authReq.user.id,
      ttlMinutes,
    });

    return res.status(201).json(session);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao criar sessão." });
  }
}