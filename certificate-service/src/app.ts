import express from 'express';
import metadataRoutes from './routes/metadata.routes';
import publicRoutes from "./routes/public.routes";

const app = express();
app.use(express.json());

app.use('/api', metadataRoutes);
app.use("/api/public", publicRoutes);

export default app;
