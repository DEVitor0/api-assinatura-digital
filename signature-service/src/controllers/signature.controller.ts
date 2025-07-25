import { Request, Response } from "express";
import * as signatureService from "../services/signatureSession.service";
import * as signatureLogService from "../services/signatureLog.service";
import { sessionSchema, signerSchema } from "../utils/signature.schema";
import { generateSignatureToken } from "../utils/jwt";

export const createSessionHandler = async (req: Request, res: Response) => {
  try {
    const validated = sessionSchema.parse(req.body);
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const session = await signatureService.createSignatureSession({
      ...validated,
      createdBy: req.user.id.toString(),
    });
    return res.status(201).json(session);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const addSignerHandler = async (req: Request, res: Response) => {
  try {
    const validated = signerSchema.parse(req.body);
    const result = await signatureService.addSigner(validated.documentId, validated.userId);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const listSignersHandler = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.query;
    if (!documentId || typeof documentId !== "string") {
      return res.status(400).json({ error: "Invalid documentId" });
    }
    const result = await signatureService.listSigners(documentId);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const removeSignerHandler = async (req: Request, res: Response) => {
  try {
    const validated = signerSchema.parse(req.body);
    const result = await signatureService.removeSigner(validated.documentId, validated.userId);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const generateTokenForSignerHandler = async (req: Request, res: Response) => {
  try {
    const { documentId, userId } = signerSchema.parse(req.body);

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const session = await signatureService.findSessionByDocumentId(documentId);
    if (!session) return res.status(404).json({ message: "Sessão não encontrada" });

    const isOwner = session.createdBy.toString() === req.user.id.toString();
    if (!isOwner) return res.status(403).json({ message: "Você não é o criador da sessão" });

    const signerExists = session.signers.some(signer =>
      signer.userId.toString() === userId.toString()
    );
    if (!signerExists) return res.status(404).json({ message: "Signatário não está na sessão" });

    const token = generateSignatureToken({
      userId,
      documentId,
      sessionId: session._id.toString(),
      type: "signature",
    });

    return res.status(201).json({ token });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const signDocumentHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.clientInfo) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { documentId, sessionId } = req.body;

    if (!documentId || !sessionId) {
      return res.status(400).json({ message: "documentId and sessionId are required" });
    }

    const session = await signatureService.findSessionByDocumentId(documentId);
    if (!session || session._id.toString() !== sessionId) {
      return res.status(404).json({ message: "Sessão não encontrada ou inválida" });
    }

    const status = "assinatura realizada";

    await signatureLogService.createSignatureLog({
      documentId,
      sessionId,
      userId: req.user.id.toString(),
      ipAddress: req.clientInfo.ipAddress,
      userAgent: req.clientInfo.userAgent,
      status,
    });

    return res.status(200).json({ message: "Assinatura registrada com sucesso" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
