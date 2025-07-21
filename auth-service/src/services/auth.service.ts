import { Request, Response } from "express";
import User from "../models/User";
import { hashPassword, comparePassword } from "../libs/hash";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SegredoBEMMMfraco";

export const registerController = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });

    const { name, email, password } = parsed.data;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(409).json({ error: "E-mail já cadastrado" });

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: "Usuário criado", id: newUser._id });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno" });
  }
};
