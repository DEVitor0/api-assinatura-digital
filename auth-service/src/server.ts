import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./pages/api/auth";
import { globalRateLimiter } from "./middlewares/rateLimiter";


import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json"; 

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use(globalRateLimiter);

app.use("/api/auth", authRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

export const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://mongo:27017/auth";
    await mongoose.connect(mongoUri);
    console.log("Conectado ao MongoDB com sucesso");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Auth service rodando na porta ${PORT}`);
      console.log(`Documentação disponível em http://localhost:${PORT}/api-docs`);
    });
  });
}

export default app;
