import { Router } from 'express';
import { generateMetadata, saveCertificateMetadata } from '../services/metadata.service';

const router = Router();

router.post('/generate-metadata', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo do documento é obrigatório.' });
  }

  try {
    const baseVerificationUrl = process.env.BASE_URL || 'http://localhost:5005';
    const metadata = await generateMetadata(content, baseVerificationUrl);
    return res.json(metadata);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar metadados.' });
  }
});

router.post('/certificates', async (req, res) => {
  try {
    const { name, signers, filePath, content } = req.body;

    if (!name || !signers || !filePath || !content) {
      return res.status(400).json({ error: "Campos obrigatórios: name, signers, filePath, content" });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5005';

    const { hash, protocol } = await generateMetadata(content, baseUrl);

    const saved = await saveCertificateMetadata({
      name,
      signers,
      originalFilePath: filePath,
      baseUrl,
      protocol,
      hash
    });

    return res.status(201).json(saved);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
