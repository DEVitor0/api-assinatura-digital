import { Request, Response } from 'express';

export const getSessionController = async (req: Request, res: Response) => {
  const user = req.user; 

  if (!user) return res.status(401).json({ message: 'Token inválido ou expirado' });

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
};
