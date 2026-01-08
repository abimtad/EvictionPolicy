import { createClient } from 'redis';
import { env } from './env.js';

const redisClient = createClient({
  url: env.redisUrl,
  socket: {
    reconnectStrategy: () => false // Disable auto-retries; we handle degraded mode ourselves.
  }
});

redisClient.on('error', (err) => {
  // Log and continue; upstream callers should handle failures gracefully.
  console.error('Redis client error', err);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}

export { redisClient };
