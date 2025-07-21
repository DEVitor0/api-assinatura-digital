import { Router } from "express";
import { loginController } from "../../../services/auth.service";

const router = Router();

router.post("/", loginController);

export default router;
