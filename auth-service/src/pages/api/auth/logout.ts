import { Router } from "express";
import { logoutController } from "../../../services/logout.service";

const router = Router();

router.post("/", logoutController);

export default router;
