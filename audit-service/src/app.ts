import express from 'express';
import mongoose from 'mongoose';
import auditRoutes from './routes/audit.routes';

const app = express();
app.use(express.json());
app.use('/api/audit', auditRoutes);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/audit')
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.error('Erro no MongoDB', err));

export default app;