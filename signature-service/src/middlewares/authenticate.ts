import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token not provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data } = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/validate-token`, { token });
    if (!data.valid) return res.status(401).json({ error: "Invalid or expired token." });

    req.user = {
      ...data.user,
      id: Types.ObjectId.isValid(data.user.id)
        ? new Types.ObjectId(data.user.id).toString()
        : data.user.id,
    };
    next();
  } catch (error: any) {
    console.error("Token validation error:", error.message);
    return res.status(500).json({ error: "Token validation failed." });
  }
};