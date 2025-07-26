import axios from "axios";

const documentServiceUrl = process.env.DOCUMENT_SERVICE_URL || "http://localhost:5002";

export async function getDocumentById(documentId: string, token: string) {
  try {
    const { data } = await axios.get(`${documentServiceUrl}/api/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error: any) {
    throw new Error(`Erro ao buscar documento: ${error.response?.data?.error || error.message}`);
  }
}
