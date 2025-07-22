import express, { Request, Response } from "express";
import { authenticate } from "../../../middlewares/authenticate";

const router = express.Router();

router.get("/", authenticate, (req: Request, res: Response) => {
  res.json({ message: `Olá ${req.user?.name}, você está autenticado!` });
});

export default router;
