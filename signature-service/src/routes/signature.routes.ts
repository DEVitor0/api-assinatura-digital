import { Router } from "express";
import {
  createSessionHandler,
  addSignerHandler,
  listSignersHandler,
  removeSignerHandler,
} from "../controllers/signature.controller";
import { authenticate } from "../middlewares/authenticate";
import { generateTokenForSignerHandler } from "../controllers/signature.controller";
import { captureClientInfo } from "../middlewares/requestInfo";
import { signDocumentHandler } from '../controllers/signature.controller';

const router = Router();

router.post("/sessions", authenticate, createSessionHandler);
router.post("/signers", authenticate, addSignerHandler);
router.get("/signers", authenticate, listSignersHandler);
router.delete("/signers", authenticate, removeSignerHandler);
router.post("/signers/token", authenticate, generateTokenForSignerHandler);
router.post("/sign", authenticate, captureClientInfo, signDocumentHandler);

export default router;