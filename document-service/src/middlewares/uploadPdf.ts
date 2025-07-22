import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

const archivesDir = path.resolve(__dirname, "..", "..", "archives");
if (!fs.existsSync(archivesDir)) {
  fs.mkdirSync(archivesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, archivesDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const uniqueName = `${uuidv4()}-${timestamp}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos PDF são permitidos."));
  }
};

export const uploadPdf = multer({ storage, fileFilter }).single("document");
