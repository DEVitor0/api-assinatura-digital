import rateLimit from "express-rate-limit";

export const bruteForceProtector = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5, 
  message: "Muitas tentativas falhas. Tente novamente em 5 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});
