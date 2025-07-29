import axios from 'axios';

const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://audit-service:5007/api/audit';

export interface AuditLog {
  action: 
    | 'REGISTER' 
    | 'LOGIN' 
    | 'FAILED_LOGIN' 
    | 'LOGOUT' 
    | 'FAILED_LOGOUT' 
    | 'SESSION_VALIDATED'
    | 'GENERATE_ACCESS_TOKEN'
    | 'GENERATE_REFRESH_TOKEN'
    | 'VALIDATE_REFRESH_TOKEN'
    | 'REVOKE_REFRESH_TOKEN';
  userId?: string;
  email?: string;
  message: string;
  timestamp?: Date;
}

export async function sendAuditLog(log: AuditLog): Promise<void> {
  try {
    await axios.post(AUDIT_SERVICE_URL, {
      ...log,
      timestamp: log.timestamp || new Date(),
    });
  } catch (error) {
    console.error('Erro ao enviar log de auditoria:', (error as any).message);
  }
}
