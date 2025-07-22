import { Request, Response } from "express";
import { createSignatureSession } from "../services/signatureSession.service";

export async function createSessionHandler(req: Request, res: Response) {
  try {
    const { documentId, signers, ttlMinutes } = req.body;

    if (!documentId || !Array.isArray(signers) || signers.length === 0) {
      return res.status(400).json({ message: "Dados inválidos." });
    }

    const session = await createSignatureSession({
      documentId,
      signers,
      createdBy: req.user!.id, 
      ttlMinutes,
    });

    return res.status(201).json(session);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao criar sessão." });
  }
}
