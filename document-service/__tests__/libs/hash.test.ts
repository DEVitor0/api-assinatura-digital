import path from "path";
import fs from "fs";
import { generateSHA256 } from "../../src/libs/hash";

describe("Função: generatePdfHash", () => {
  const testPdfPath = path.resolve(__dirname, "../files/test-hash.pdf");

  beforeAll(() => {
    if (!fs.existsSync(testPdfPath)) {
      fs.mkdirSync(path.dirname(testPdfPath), { recursive: true });
      fs.writeFileSync(testPdfPath, "%PDF-1.4\n%hash-test");
    }
  });

  it("deve gerar um hash SHA256 válido para o arquivo PDF", async () => {
    const hash = await generateSHA256(testPdfPath);
    expect(typeof hash).toBe("string");
    expect(hash).toMatch(/^[a-f0-9]{64}$/); // formato SHA256
  });

  it("deve gerar o mesmo hash para o mesmo arquivo PDF", async () => {
    const hash1 = await generateSHA256(testPdfPath);
    const hash2 = await generateSHA256(testPdfPath);
    expect(hash1).toBe(hash2);
  });

  it("deve lançar erro ao tentar gerar hash de arquivo inexistente", async () => {
    const fakePath = path.resolve(__dirname, "../files/inexistente.pdf");

    await expect(generateSHA256(fakePath)).rejects.toThrow();
  });
});
