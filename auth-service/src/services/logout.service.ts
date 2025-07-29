import { Request, Response } from 'express';
import { RefreshToken } from '../models/RefreshToken';
import { sendAuditLog } from '../libs/audit-service';

export const logoutController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh Token é obrigatório' });
  }

  const deleted = await RefreshToken.findOneAndDelete({ token: refreshToken });

  if (!deleted) {
    await sendAuditLog({
      action: 'FAILED_LOGOUT',
      message: 'Tentativa de logout com token inválido ou já revogado.',
    });

    return res.status(404).json({ message: 'Refresh Token não encontrado ou já revogado' });
  }

  await sendAuditLog({
    action: 'LOGOUT',
    userId: deleted.userId.toString(),
    message: 'Logout realizado com sucesso. Refresh Token revogado.',
  });

  return res.status(204).send();
};
