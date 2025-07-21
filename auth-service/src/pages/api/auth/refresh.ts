import { Router, Request, Response } from "express";
import { validateRefreshToken, generateAccessToken, generateRefreshToken, revokeRefreshToken } from "../../../services/token.service";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required." });
    }

    const userPayload = await validateRefreshToken(refreshToken);

    if (!userPayload) {
      return res.status(401).json({ error: "Invalid or expired refresh token." });
    }

    await revokeRefreshToken(refreshToken);

    const accessToken = generateAccessToken(userPayload);
    const newRefreshToken = await generateRefreshToken(userPayload);

    return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
