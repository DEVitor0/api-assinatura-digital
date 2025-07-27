import { Router } from "express";
import { getCertificateByUUIDOrHashHandler } from "../controllers/public.controller";

const router = Router();

router.get("/certificates/:identifier", getCertificateByUUIDOrHashHandler);

export default router;
