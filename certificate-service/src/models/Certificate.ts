import mongoose, { Schema } from "mongoose";

const certificateSchema = new Schema(
  {
    name: { type: String, required: true },
    hash: { type: String, required: true, unique: true },
    filePath: { type: String, required: true },
    signers: [{ type: String, required: true }],
    url: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Certificate = mongoose.model("Certificate", certificateSchema);
