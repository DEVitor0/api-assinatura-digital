import { Request, Response } from 'express';
import { registrarLog, buscarLogs } from '../services/audit.services';

export async function criarLogHandler(req: Request, res: Response) {
  try {
    const log = await registrarLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar log.' });
  }
}

export async function listarLogsHandler(req: Request, res: Response) {
  try {
    const filtro = req.query || {};
    const logs = await buscarLogs(filtro);
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar logs.' });
  }
}