import AuditLog from '../model/AuditLog';

export async function registrarLog(logData: any) {
  const log = new AuditLog(logData);
  return await log.save();
}

export async function buscarLogs(filtro: any) {
  return await AuditLog.find(filtro).sort({ createdAt: -1 });
}