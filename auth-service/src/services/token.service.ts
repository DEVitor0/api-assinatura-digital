import jwt from "jsonwebtoken";
import { RefreshToken } from "../models/RefreshToken";
import { Types } from "mongoose";
import { sendAuditLog } from '../libs/audit-service';

const ACCESS_TOKEN_EXPIRATION = "15m"; 
const REFRESH_TOKEN_EXPIRATION = "7d";

interface UserPayload {
  id: string;
  role: "admin" | "user" | "signer";
}

export const generateAccessToken = (user: UserPayload): string => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: ACCESS_TOKEN_EXPIRATION }
  );

  sendAuditLog({
    action: 'GENERATE_ACCESS_TOKEN',
    userId: user.id,
    message: `Access token gerado para usuário ${user.id}`,
  }).catch(console.error);

  return token;
};

export const generateRefreshToken = async (user: UserPayload): Promise<string> => {
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: REFRESH_TOKEN_EXPIRATION }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); 

  const refreshToken = new RefreshToken({
    userId: new Types.ObjectId(user.id),
    token,
    expiresAt,
  });

  await refreshToken.save();

  await sendAuditLog({
    action: 'GENERATE_REFRESH_TOKEN',
    userId: user.id,
    message: `Refresh token gerado para usuário ${user.id}`,
  });

  return token;
};

export const validateRefreshToken = async (token: string): Promise<UserPayload | null> => {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const storedToken = await RefreshToken.findOne({ token });

    if (!storedToken) {
      await sendAuditLog({
        action: 'VALIDATE_REFRESH_TOKEN',
        message: 'Refresh token não encontrado',
      });
      return null;
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token });
      await sendAuditLog({
        action: 'VALIDATE_REFRESH_TOKEN',
        userId: payload.id,
        message: 'Refresh token expirado e removido',
      });
      return null;
    }

    await sendAuditLog({
      action: 'VALIDATE_REFRESH_TOKEN',
      userId: payload.id,
      message: 'Refresh token validado com sucesso',
    });

    return { id: payload.id, role: "user" };
  } catch (error) {
    await sendAuditLog({
      action: 'VALIDATE_REFRESH_TOKEN',
      message: `Erro na validação do refresh token: ${(error as Error).message}`,
    });
    return null;
  }
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.deleteOne({ token });

  await sendAuditLog({
    action: 'REVOKE_REFRESH_TOKEN',
    message: 'Refresh token revogado',
  });
};
