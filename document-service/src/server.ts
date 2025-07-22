import express from "express";
import dotenv from "dotenv";
import documentsRouter from "./pages/api/documents/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/api/documents", documentsRouter);

app.listen(PORT, () => {
  console.log(`Document-service rodando na porta ${PORT}`);
});
