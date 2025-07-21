import { Request, Response, NextFunction } from "express";
import { JwtUserPayload } from "../types/jwt-payload";
import jwt from "jsonwebtoken";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
