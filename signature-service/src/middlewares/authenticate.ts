import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

interface AuthResponse {
  valid: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "user" | "signer";
  };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data } = await axios.post<AuthResponse>(
      "http://auth-service:5001/api/auth/validate-token", 
      { token }
    );

    if (!data.valid) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    req.user = {
      ...data.user,
      id: Types.ObjectId.isValid(data.user.id) 
        ? new Types.ObjectId(data.user.id).toString() 
        : data.user.id
    };
    
    next();
  } catch (error) {
    const err = error as Error;
    console.error("Erro ao validar token:", err.message);
    return res.status(500).json({ error: "Erro ao validar token." });
  }
};