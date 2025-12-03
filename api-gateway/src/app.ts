import express from 'express';
import { json } from 'body-parser';
import routes from './routes/index';
import { authMiddleware } from './middlewares/auth';
import { proxyMiddleware } from './middlewares/proxy';

const app = express();

app.use(json());
app.use(authMiddleware);
app.use(proxyMiddleware);
app.use(routes);

export default app;