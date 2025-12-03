import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const services = {
  serviceA: 'http://localhost:5001',
  serviceB: 'http://localhost:5002',
  serviceC: 'http://localhost:5003',
};

const proxy = (req: Request, res: Response, next: NextFunction) => {
  const { originalUrl } = req;

  if (originalUrl.startsWith('/serviceA')) {
    createProxyMiddleware({ target: services.serviceA, changeOrigin: true })(req, res, next);
  } else if (originalUrl.startsWith('/serviceB')) {
    createProxyMiddleware({ target: services.serviceB, changeOrigin: true })(req, res, next);
  } else if (originalUrl.startsWith('/serviceC')) {
    createProxyMiddleware({ target: services.serviceC, changeOrigin: true })(req, res, next);
  } else {
    next();
  }
};

export default proxy;