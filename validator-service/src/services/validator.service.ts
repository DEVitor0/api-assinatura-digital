import { getCertificateByIdentifier } from '../clients/certificateClient';
import { getDocumentById, downloadDocumentFile } from '../clients/documentClient';
import { gerarHash } from '../utils/hashUtils';

interface ValidationResult {
  valido: boolean;
  mensagem: string;
  hashOriginal?: string;
  hashCalculado?: string;
  certificado?: any;
  documento?: any;
}

export async function validarDocumentoPorCodigo(codigo: string, token?: string): Promise<ValidationResult> {
  try {
    const certificado = await getCertificateByIdentifier(codigo);
    if (!certificado) {
      return { valido: false, mensagem: 'Certificado não encontrado.' };
    }

    const documentId = certificado.documentId || certificado.filePath || certificado.documentId;
    if (!documentId) {
      return { valido: false, mensagem: 'Documento vinculado ao certificado não encontrado.' };
    }

    const documento = await getDocumentById(documentId, token);

    if (!documento) {
      return { valido: false, mensagem: 'Documento não encontrado.' };
    }

    const arquivoBuffer = await downloadDocumentFile(documento.path);
    const hashCalculado = gerarHash(arquivoBuffer);

    const hashOriginal = certificado.hash;
    const valido = hashOriginal === hashCalculado;

    return {
      valido,
      mensagem: valido ? 'Documento íntegro e válido.' : 'Documento corrompido ou alterado.',
      hashOriginal,
      hashCalculado,
      certificado,
      documento,
    };
  } catch (error: any) {
    return {
      valido: false,
      mensagem: `Erro na validação: ${error.message || error}`,
    };
  }
}
