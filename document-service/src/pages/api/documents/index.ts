import express, { Request, Response } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import mongoose from "mongoose";
import { Document } from "../../../models/Document";

const router = express.Router();

router.get("/me", authenticate, (req: Request, res: Response) => {
  res.json({ message: `Olá ${req.user?.name}, você está autenticado!` });
});

router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    const documentos = await Document.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(documentos);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar documentos." });
  }
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    const documento = await Document.findOne({ _id: id, uploadedBy: req.user.id });

    if (!documento) {
      return res.status(404).json({ error: "Documento não encontrado." });
    }

    return res.status(200).json(documento);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar documento." });
  }
});

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    const deleted = await Document.findOneAndDelete({ _id: id, uploadedBy: req.user.id });

    if (!deleted) {
      return res.status(404).json({ error: "Documento não encontrado ou não pertence ao usuário." });
    }

    return res.status(200).json({ message: "Documento deletado com sucesso." });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao deletar documento." });
  }
});

export default router;
