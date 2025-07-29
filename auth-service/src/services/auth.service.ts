import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User";
import { hashPassword, comparePassword } from "../libs/hash";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { sendAuditLog } from "../libs/audit-service";

const JWT_SECRET = process.env.JWT_SECRET || "SegredoBEMMMfraco";

// Registro de novo usuário
export const registerController = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const { name, email, password } = parsed.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ name, email, password: hashedPassword });

    await sendAuditLog({
      action: "REGISTER",
      userId: newUser._id.toString(),
      email: newUser.email,
      message: "Usuário registrado com sucesso.",
    });

    return res.status(201).json({ message: "Usuário criado", id: newUser._id });
  } catch (err) {
    console.error("Erro no registerController:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
};

// Login de usuário
export const loginController = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      await sendAuditLog({
        action: "FAILED_LOGIN",
        email,
        message: "Tentativa de login com e-mail não registrado.",
      });
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      await sendAuditLog({
        action: "FAILED_LOGIN",
        userId: user._id.toString(),
        email: user.email,
        message: "Tentativa de login com senha incorreta.",
      });
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await sendAuditLog({
      action: "LOGIN",
      userId: user._id.toString(),
      email: user.email,
      message: "Login realizado com sucesso.",
    });

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Erro no loginController:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
};
