import express from 'express';
import validatorRoutes from './routes/validator.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';

const app = express();
app.use(express.json());

app.use('/api/validator', validatorRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
