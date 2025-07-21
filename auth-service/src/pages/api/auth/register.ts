import { Router } from "express";
import { registerController } from "../../../services/auth.service";

const router = Router();

router.post("/", registerController);

export default router;
