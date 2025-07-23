import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import router from "./routes/signature.routes"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", router);
app.get("/", (req, res) => {
  res.send("Signature Service está online");
});

app.listen(PORT, () => {
  console.log(`Signature Service rodando na porta ${PORT}`);
});
