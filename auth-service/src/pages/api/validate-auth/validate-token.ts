import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtUserPayload } from "../../../types/jwt-payload";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token é obrigatório." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;
    return res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, error: "Token inválido ou expirado." });
  }
});

export default router;
