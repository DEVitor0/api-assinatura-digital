// src/services/metadata.service.ts
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export interface MetadataResult {
  hash: string;
  protocol: string;
  qrCodeDataUrl: string;
}

export async function generateMetadata(documentContent: string, baseVerificationUrl: string): Promise<MetadataResult> {
  const hash = createHash('sha256').update(documentContent).digest('hex');

  const protocol = uuidv4();

  const verificationUrl = `${baseVerificationUrl}/verify/${protocol}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

  return {
    hash,
    protocol,
    qrCodeDataUrl,
  };
}
