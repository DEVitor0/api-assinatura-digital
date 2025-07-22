import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
});

redis.on("connect", () => console.log("✅ Redis conectado"));
redis.on("error", (err) => console.error("❌ Redis erro", err));

export default redis;
