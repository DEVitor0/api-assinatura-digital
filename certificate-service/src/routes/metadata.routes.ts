import { Router } from 'express';
import { generateMetadataFromContent, generateMetadataFromFile, saveCertificateMetadata } from '../services/metadata.service';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/generate-metadata', authenticate, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo do documento é obrigatório.' });
  }

  try {
    const baseVerificationUrl = process.env.BASE_URL || 'http://localhost:5005';
    const metadata = await generateMetadataFromContent(content, baseVerificationUrl);
    return res.json(metadata);
  } catch (err) {
    console.error('Erro ao gerar metadados:', err);
    return res.status(500).json({ error: 'Erro ao gerar metadados.' });
  }
});

router.post('/certificates', authenticate, async (req, res) => {
  try {
    const { name, signers, filePath } = req.body;

    if (!name || !signers || !filePath) {
      return res.status(400).json({ error: "Campos obrigatórios: name, signers, filePath" });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5005';

    const { hash, protocol } = await generateMetadataFromFile(filePath, baseUrl);

    const saved = await saveCertificateMetadata({
      name,
      signers,
      documentId: filePath,
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
