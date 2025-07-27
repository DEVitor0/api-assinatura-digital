import { Router } from 'express';
import { validarDocumentoHandler } from '../controllers/validator.controller';

const router = Router();

router.get('/verify/:codigo', validarDocumentoHandler);

export default router;
