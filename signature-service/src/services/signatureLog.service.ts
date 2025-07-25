import SignatureLog, { ISignatureLog } from "../models/SignatureLog";

export async function createSignatureLog(data: {
  documentId: string;
  sessionId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  status: string;
}): Promise<ISignatureLog> {
  const log = new SignatureLog(data);
  return await log.save();
}
