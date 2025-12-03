import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import routes from './routes/index';
import { authMiddleware } from './middlewares/auth';

const app = express();

// Middleware for authentication
app.use(authMiddleware);

// Setup routes
app.use('/api', routes);

// Proxy middleware for routing requests to respective microservices
app.use('/service1', createProxyMiddleware({ target: 'http://service1-url', changeOrigin: true }));
app.use('/service2', createProxyMiddleware({ target: 'http://service2-url', changeOrigin: true }));

export default app;