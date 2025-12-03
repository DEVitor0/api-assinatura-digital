import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { proxyMiddleware } from '../middlewares/proxy';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Define routes for microservices
router.use('/service1', proxyMiddleware('http://service1-url'));
router.use('/service2', proxyMiddleware('http://service2-url'));
router.use('/service3', proxyMiddleware('http://service3-url'));

// Add more routes as needed

export default router;