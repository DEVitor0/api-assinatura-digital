import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./pages/api/auth";
import { globalRateLimiter } from "./middlewares/rateLimiter";

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use(globalRateLimiter); 

app.use("/api/auth", authRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
}

export default app;
