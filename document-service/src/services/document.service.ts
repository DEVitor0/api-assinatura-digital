import { Document, DocumentAttrs } from "../models/Document";
import { Types } from "mongoose";

export async function saveDocumentMetadata(data: DocumentAttrs) {
  const document = new Document({
    originalName: data.originalName,
    storedName: data.storedName,
    mimeType: data.mimeType,
    hash: data.hash,
    uploadedBy: new Types.ObjectId(data.uploadedBy),
  });

  return await document.save();
}
