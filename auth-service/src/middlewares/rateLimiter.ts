import rateLimit from "express-rate-limit";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    error: "Você excedeu o limite de requisições. Tente novamente mais tarde.",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});
