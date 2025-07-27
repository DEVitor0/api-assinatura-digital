import { createHash } from "crypto";
import fs from "fs/promises";

/**
 * @param filePath 
 * @returns 
 */
export async function generateSHA256(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const hash = createHash("sha256").update(fileBuffer).digest("hex");
  return hash;
}
