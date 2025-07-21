import { Request, Response, NextFunction } from "express";

export const authorize = (allowedRoles: Array<"admin" | "user" | "signer">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso negado para sua permissão." });
    }

    next();
  };
};
