import crypto from "crypto";
import fs from "fs/promises";

/**
 * Gera hash SHA256 do arquivo, dado o caminho ou buffer.
 * 
 * @param input
 * @returns 
 */
export async function generateSHA256(input: string | Buffer): Promise<string> {
  let dataBuffer: Buffer;

  if (typeof input === "string") {
    dataBuffer = await fs.readFile(input);
  } else {
    dataBuffer = input;
  }

  const hash = crypto.createHash("sha256");
  hash.update(dataBuffer);

  return hash.digest("hex");
}
