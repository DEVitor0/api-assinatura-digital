import { Router } from 'express';
import { validarDocumentoHandler } from '../controllers/validator.controller';

const router = Router();

router.get('/verify/:codigo', validarDocumentoHandler);
router.get('/healthcheck', (_, res) => {
  res.status(200).json({ status: 'ok', service: 'validator-service', uptime: process.uptime() });
});


export default router;
