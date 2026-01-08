import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  rateLimit: {
    windowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60),
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 5)
  },
  cacheCapacity: Number(process.env.CACHE_CAPACITY || 100),
  cacheSaveDelayMs: Number(process.env.CACHE_SAVE_DELAY_MS || 30000)
};
