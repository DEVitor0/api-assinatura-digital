import { Request, Response } from "express";
import Metadata from "../models/Metadata";

export const getCertificateByUUIDOrHashHandler = async (req: Request, res: Response) => {
  const { identifier } = req.params;

  const cert = await Metadata.findOne({
    $or: [{ uuid: identifier }, { hash: identifier }],
  });

  if (!cert) {
    return res.status(404).json({ error: "Certificado não encontrado." });
  }

  return res.status(200).json(cert);
};
