import { Request, Response, NextFunction } from "express";
import requestIp from "request-ip";

export function captureClientInfo(req: Request, res: Response, next: NextFunction) {
  const ipAddress = requestIp.getClientIp(req) || "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";

  req.clientInfo = {
    ipAddress,
    userAgent: userAgent.toString(),
  };

  next();
}
