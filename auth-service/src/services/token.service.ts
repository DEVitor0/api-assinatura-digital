import jwt from "jsonwebtoken";
import { RefreshToken } from "../models/RefreshToken";
import { Types } from "mongoose";

const ACCESS_TOKEN_EXPIRATION = "15m"; 
const REFRESH_TOKEN_EXPIRATION = "7d";

interface UserPayload {
  id: string;
  role: "admin" | "user" | "signer";
}

export const generateAccessToken = (user: UserPayload): string => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: ACCESS_TOKEN_EXPIRATION }
  );
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

  return token;
};

export const validateRefreshToken = async (token: string): Promise<UserPayload | null> => {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const storedToken = await RefreshToken.findOne({ token });

    if (!storedToken) return null;
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token });
      return null;
    }

    return { id: payload.id, role: "user" }; 
  } catch {
    return null;
  }
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.deleteOne({ token });
};
