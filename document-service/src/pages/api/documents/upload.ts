import { Router, Request, Response } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import { uploadPdf } from "../../../middlewares/uploadPdf";

const router = Router();

router.post("/", authenticate, (req: Request, res: Response) => {
  uploadPdf(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado." });
    }

    return res.status(200).json({
      message: "Upload realizado com sucesso.",
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        size: req.file.size,
        path: req.file.path,
      },
    });
  });
});

export default router;
