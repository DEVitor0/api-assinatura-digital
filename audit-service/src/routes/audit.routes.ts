import { Router } from 'express';
import { criarLogHandler, listarLogsHandler } from '../controllers/audit.controller';

const router = Router();

router.post('/', criarLogHandler);
router.get('/', listarLogsHandler);

export default router;