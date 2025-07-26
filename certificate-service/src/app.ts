import express from 'express';
import metadataRoutes from './routes/metadata.routes';

const app = express();
app.use(express.json());

app.use('/api', metadataRoutes);

export default app;
