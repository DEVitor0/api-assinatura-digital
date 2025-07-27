import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { Certificate } from "../models/Certificate";
import { generateSHA256 } from "../utils/hash";
import { generateQRCode } from "../utils/qrcode";

export interface MetadataResult {
  hash: string;
  protocol: string;
  qrCodeDataUrl: string;
  downloadUrl: string;
  verificationUrl: string;
}

export async function generateMetadata(
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

export async function saveCertificateMetadata({
  name,
  signers,
  originalFilePath,
  baseUrl,
  protocol,
  hash,
}: {
  name: string;
  signers: string[];
  originalFilePath: string;
  baseUrl: string;
  protocol: string;
  hash: string;
}) {
  const fileBuffer = await fs.readFile(originalFilePath);
  const publicPath = path.resolve(__dirname, "../public/certificates");
  const outputFilePath = path.join(publicPath, `${protocol}.pdf`);

  await fs.mkdir(publicPath, { recursive: true });
  await fs.writeFile(outputFilePath, fileBuffer);

  const url = `${baseUrl}/certificates/${protocol}.pdf`;

  const saved = await Certificate.create({
    name,
    hash,
    signers,
    url,
    filePath: outputFilePath,
    uuid: protocol,
  });

  return {
    certificate: saved,
    downloadUrl: url,
  };
}
