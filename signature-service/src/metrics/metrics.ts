import client from "prom-client";
import RedisClient from "../services/redis/client";

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const signatureSessionsCreated = new client.Counter({
  name: "signature_sessions_created_total",
  help: "Total de sessões de assinatura criadas",
});
register.registerMetric(signatureSessionsCreated);

export const signatureSessionDuration = new client.Histogram({
  name: "signature_session_creation_duration_seconds",
  help: "Duração da criação de sessão de assinatura em segundos",
  buckets: [0.1, 0.5, 1, 2, 5],
});
register.registerMetric(signatureSessionDuration);

export async function updateActiveSessionsGauge() {
  const keys = await RedisClient.keys("session:*");
  activeRedisSessions.set(keys.length);
}

export const activeRedisSessions = new client.Gauge({
  name: "signature_sessions_active_redis",
  help: "Número de sessões de assinatura ativas no Redis",
});
register.registerMetric(activeRedisSessions);
