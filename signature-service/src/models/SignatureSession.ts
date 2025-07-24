import mongoose from "mongoose";

const SignatureSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
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
      default: null,
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
