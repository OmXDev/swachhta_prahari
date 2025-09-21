const { createClient } = require("redis");
let client;

const connectRedis = async () => {
  if (client) return client;

  if (process.env.NODE_ENV === "beta") {
    client = createClient({
      url: process.env.UPSTASH_REDIS_URL,
    });
  } else {
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: +(process.env.REDIS_PORT || 6379),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();
  return client;
};

const getRedisClient = () => client;

module.exports = { connectRedis, getRedisClient };
