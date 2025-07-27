import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import { generateSHA256 } from "../utils/hash";
import { generateQRCode } from "../utils/qrcode";
import Metadata from "../models/Metadata";
import axios from "axios";

export interface MetadataResult {
  hash: string;
  protocol: string;
  qrCodeDataUrl: string;
  downloadUrl: string;
  verificationUrl: string;
}


export async function validateDocumentExists(documentId: string) {
  const response = await axios.get(`http://document-service:5002/api/documents/${documentId}`);
  if (response.status !== 200 || !response.data) {
    throw new Error("Documento não encontrado no document-service.");
  }
}

export async function saveCertificateMetadata({
  name,
  signers,
  documentId,
  baseUrl,
  protocol,
  hash,
}: {
  name: string;
  signers: string[];
  documentId: string;
  baseUrl: string;
  protocol: string;
  hash: string;
}) {
  await validateDocumentExists(documentId);

  const url = `${baseUrl}/certificates/${protocol}.pdf`;

  const saved = await Metadata.create({
    name,
    hash,
    signers,
    url,
    documentId,
    uuid: protocol,
  });

  return {
    metadata: saved,
    downloadUrl: url,
  };
}

export async function generateMetadataFromContent(
  content: string,
  baseVerificationUrl: string
): Promise<MetadataResult> {
  const hash = createHash("sha256").update(content).digest("hex");
  const protocol = uuidv4();

  const verificationUrl = `${baseVerificationUrl}/verify/${protocol}`;
  const downloadUrl = `${baseVerificationUrl}/certificates/${protocol}.pdf`;

  const qrCodeDataUrl = await generateQRCode(verificationUrl);

  return {
    hash,
    protocol,
    qrCodeDataUrl,
    downloadUrl,
    verificationUrl,
  };
}

export async function generateMetadataFromFile(
  filePath: string,
  baseVerificationUrl: string
): Promise<MetadataResult> {
  const hash = await generateSHA256(filePath);
  const protocol = uuidv4();

  const verificationUrl = `${baseVerificationUrl}/verify/${protocol}`;
  const downloadUrl = `${baseVerificationUrl}/certificates/${protocol}.pdf`;

  const qrCodeDataUrl = await generateQRCode(verificationUrl);

  return {
    hash,
    protocol,
    qrCodeDataUrl,
    downloadUrl,
    verificationUrl,
  };
}
