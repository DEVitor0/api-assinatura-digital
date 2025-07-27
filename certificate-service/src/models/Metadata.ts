import mongoose, { Schema, Document } from "mongoose";

export interface MetadataDocument extends Document {
  name: string;
  hash: string;
  signers: string[];
  url: string;
  filePath: string;
  uuid: string;
  createdAt: Date;
}

const MetadataSchema: Schema<MetadataDocument> = new Schema(
  {
    name: { type: String, required: true },
    hash: { type: String, required: true, unique: true },
    signers: [{ type: String, required: true }],
    url: { type: String, required: true },
    filePath: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model<MetadataDocument>("Metadata", MetadataSchema);
