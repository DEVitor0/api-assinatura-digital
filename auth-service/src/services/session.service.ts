import { Request, Response } from 'express';
import { sendAuditLog } from '../libs/audit-service';

export const getSessionController = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    await sendAuditLog({
      action: 'FAILED_LOGIN',
      message: 'Token inválido ou expirado na verificação de sessão',
    });

    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }

  await sendAuditLog({
    action: 'SESSION_VALIDATED',
    userId: user.id,
    email: user.email,
    message: 'Sessão validada com sucesso',
  });

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
};
