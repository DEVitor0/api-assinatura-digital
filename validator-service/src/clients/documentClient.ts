import axios from 'axios';

const documentServiceBaseURL = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:5002/api/documents';

export interface DocumentData {
  _id: string;
  storedName: string;
  path: string;
  hash: string;
}

export async function getDocumentById(id: string, token?: string): Promise<DocumentData> {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`${documentServiceBaseURL}/${id}`, { headers });
    return response.data;
  } catch (error: any) {
    throw new Error(`Erro ao buscar documento: ${error.response?.data?.error || error.message}`);
  }
}

export async function downloadDocumentFile(filePath: string): Promise<Buffer> {
  try {
    const response = await axios.get(filePath, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error: any) {
    throw new Error(`Erro ao baixar arquivo do documento: ${error.message}`);
  }
}
