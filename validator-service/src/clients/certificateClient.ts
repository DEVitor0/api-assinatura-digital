import axios from 'axios';

const certificateServiceBaseURL = process.env.CERTIFICATE_SERVICE_URL || 'http://localhost:5005/api/public';

export async function getCertificateByIdentifier(identifier: string) {
  try {
    const response = await axios.get(`${certificateServiceBaseURL}/certificates/${identifier}`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Erro ao buscar certificado: ${error.response?.data?.error || error.message}`);
  }
}
