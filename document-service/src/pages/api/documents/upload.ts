import { Router, Request, Response } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import { uploadPdf } from "../../../middlewares/uploadPdf";
import { generateSHA256 } from "../../../libs/hash";
import { saveDocumentMetadata } from "../../../services/document.service";

import { Types } from "mongoose";

const router = Router();

router.post("/", authenticate, (req: Request, res: Response) => {
  uploadPdf(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado." });
    }

    try {
      const hash = await generateSHA256(req.file.path);

      const savedDoc = await saveDocumentMetadata({
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        hash,
        uploadedBy: new Types.ObjectId(req.user!.id),
      });

      return res.status(200).json({
        message: "Upload realizado com sucesso.",
        file: {
          id: savedDoc._id,
          originalName: savedDoc.originalName,
          storedName: savedDoc.storedName,
          size: req.file.size,
          path: req.file.path,
          hash: savedDoc.hash,
        },
      });
    } catch (error) {
      console.error("Erro ao processar upload:", error);
      return res.status(500).json({ error: "Erro ao processar upload." });
    }
  });
});

export default router;
