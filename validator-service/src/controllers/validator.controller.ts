import { Request, Response } from 'express';
import { validarDocumentoPorCodigo } from '../services/validator.service';

export async function validarDocumentoHandler(req: Request, res: Response) {
  const codigo = req.params.codigo;
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!codigo) {
    return res.status(400).json({ error: 'Código do certificado é obrigatório.' });
  }

  const resultado = await validarDocumentoPorCodigo(codigo, token);

  if (!resultado.valido) {
    return res.status(400).json({ mensagem: resultado.mensagem, hashOriginal: resultado.hashOriginal, hashCalculado: resultado.hashCalculado });
  }

  return res.status(200).json(resultado);
}
