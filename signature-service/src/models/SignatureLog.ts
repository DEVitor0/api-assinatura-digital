import { Schema, model, Document } from "mongoose";

export interface ISignatureLog extends Document {
  documentId: string;
  sessionId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  status: string;
  createdAt: Date;
}

const SignatureLogSchema = new Schema<ISignatureLog>(
  {
    documentId: { type: String, required: true },
    sessionId: { type: String, required: true },
    userId: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    status: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<ISignatureLog>("SignatureLog", SignatureLogSchema);
