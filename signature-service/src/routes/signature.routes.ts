import { Router } from "express";
import { createSessionHandler } from "../controllers/signature.controller";
import { adicionarSignatario } from "../controllers/signature.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/sessions", authenticate, createSessionHandler);
router.post("/signatures", authenticate, adicionarSignatario);

export default router;