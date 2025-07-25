import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import router from "./routes/signature.routes";
import { connectRabbitMQ } from './services/rabbit/rabbit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", router);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (_, res) => res.send("Signature Service is running"));

connectRabbitMQ()
  .then((): void => console.log("✔️ RabbitMQ conectado"))
  .catch((err: Error): void => {
    console.error("Erro ao conectar RabbitMQ:", err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`📝 Signature-service rodando na porta ${PORT}`);
  console.log(`📚 Documentação Swagger disponível em http://localhost:${PORT}/api/docs`);
});
