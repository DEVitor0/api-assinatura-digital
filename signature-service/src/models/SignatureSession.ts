import mongoose from "mongoose";

const SignatureSessionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Document",
    },
    signers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "signed", "rejected"],
          default: "pending",
        },
        signedAt: Date,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SignatureSession", SignatureSessionSchema);
