import { Schema, model, Types, Document as MongooseDocument } from "mongoose";

export interface DocumentAttrs {
  originalName: string;
  storedName: string;
  mimeType: string;
  hash: string;
  uploadedBy: Types.ObjectId;
}

export interface DocumentDoc extends MongooseDocument {
  originalName: string;
  storedName: string;
  mimeType: string;
  hash: string;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<DocumentDoc>(
  {
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    hash: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export const Document = model<DocumentDoc>("Document", documentSchema);
