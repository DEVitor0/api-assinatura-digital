import axios from "axios";

/**
 * @param documentId 
 * @param token 
 * @returns 
 * @throws 
 */
export async function verifyDocumentOwnership(documentId: string, token: string) {
  if (!token) {
    throw new Error("Token de autenticação ausente.");
  }

  try {
    const response = await axios.get(`http://document-service:5002/api/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 401) {
      throw new Error("Usuário não autenticado.");
    }

    if (status === 404) {
      throw new Error("Documento não encontrado ou não pertence ao usuário.");
    }

    throw new Error("Erro ao validar documento.");
  }
}
