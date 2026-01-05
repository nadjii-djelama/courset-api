import { createClient } from "redis";
const redisClient = createClient();

const redisServer = async () => {
  try {
    redisClient.on("error", (err) => {
      console.log("❌ Redis client error", err);
    });
    redisClient.on("connect", () => {
      console.log("✅ Redis client connected");
    });
    await redisClient.connect();
    await redisClient.ping();
  } catch (error) {
    console.error("Failed to connect to Redis server:", error);
  }
};

export { redisClient, redisServer };
