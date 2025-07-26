import { Router } from 'express';
import { generateMetadata } from '../services/metadata.service';

const router = Router();

router.post('/generate-metadata', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo do documento é obrigatório.' });
  }

  try {
    const baseVerificationUrl = process.env.BASE_URL || 'http://localhost:3000';
    const metadata = await generateMetadata(content, baseVerificationUrl);
    return res.json(metadata);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar metadados.' });
  }
});

export default router;
