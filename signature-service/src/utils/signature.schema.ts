import { z } from "zod";

export const sessionSchema = z.object({
  documentId: z.string().min(1),
  signers: z.array(z.string().min(1)),
  ttlMinutes: z.number().optional(),
});

export const signerSchema = z.object({
  documentId: z.string().min(1),
  userId: z.string().min(1),
});
