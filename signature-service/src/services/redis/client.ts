import Redis from "ioredis";

let redis: Redis;

redis = new Redis({
  host: "redis",         
  port: 6379,        
  password: undefined, 
});

redis.on("error", (err) => {
  console.error("❌ Redis erro", err);
});

export default redis!;
