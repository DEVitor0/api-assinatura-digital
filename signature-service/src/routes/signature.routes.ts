import { Router } from "express";
import { createSessionHandler } from "../controllers/signature.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/sessions", authenticate, createSessionHandler);

export default router;
