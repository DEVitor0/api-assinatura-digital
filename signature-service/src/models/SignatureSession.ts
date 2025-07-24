import mongoose from "mongoose";

const SignatureSessionSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Document" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  expiresAt: { type: Date, required: true },
  signers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
      status: { type: String, enum: ["pending", "signed", "rejected"], default: "pending" },
      signedAt: Date,
    },
  ],
  status: { type: String, enum: ["active", "expired", "completed"], default: "active" },
}, { timestamps: true });

export default mongoose.model("SignatureSession", SignatureSessionSchema);