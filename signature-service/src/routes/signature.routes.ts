import { Router } from "express";
import { createSessionHandler } from "../models/controllers/signature.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/sessions", authenticate, createSessionHandler);

export default router;