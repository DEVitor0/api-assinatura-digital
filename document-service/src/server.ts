import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import documentsRouter from "./pages/api/documents/index";
import uploadDocumentsRouter from "./pages/api/documents/upload";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());

app.use("/api/documents", documentsRouter);
app.use("/api/documents/upload", uploadDocumentsRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://mongo-documents:27017/documents";
    await mongoose.connect(mongoUri);
    console.log("✅ Document-service conectado ao MongoDB com sucesso");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`📦 Document-service rodando na porta ${PORT}`);
      console.log(`📚 Documentação Swagger disponível em http://localhost:${PORT}/api/docs`);
    });
  });
}

export default app;
