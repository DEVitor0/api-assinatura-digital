import express from 'express';
import validatorRoutes from './routes/validator.routes';

const app = express();
app.use(express.json());

app.use('/api/validator', validatorRoutes);

export default app;
