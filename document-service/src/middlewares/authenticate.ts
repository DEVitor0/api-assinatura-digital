import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { JwtUserPayload } from "../types/jwt-payload";

interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";
    const { data } = await axios.post(`${AUTH_SERVICE_URL}/api/auth/validate-token`, { token });

    if (!data.valid) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    req.user = data.user as JwtUserPayload; 
    
    next();
  } catch (error) {
    const err = error as Error;
    console.error("Erro ao validar token:", err.message);
    return res.status(500).json({ error: "Erro ao validar token." });
  }
};

export type { AuthenticatedRequest };