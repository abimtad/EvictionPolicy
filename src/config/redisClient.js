import { createClient } from 'redis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { env } from './env.js';

const useUpstash = Boolean(env.upstash?.restUrl && env.upstash?.restToken);

let redisClient;

if (useUpstash) {
  // Upstash HTTP-based client (no TCP connection lifecycle)
  redisClient = new UpstashRedis({
    url: env.upstash.restUrl,
    token: env.upstash.restToken
  });
} else {
  // Local/standard Redis via node-redis
  redisClient = createClient({
    url: env.redisUrl,
    socket: {
      reconnectStrategy: () => false // Disable auto-retries; we handle degraded mode ourselves.
    }
  });

  redisClient.on('error', (err) => {
    // Log and continue; upstream callers should handle failures gracefully.
    console.error('Redis client error', err);
  });
}

export async function connectRedis() {
  if (useUpstash) {
    // Upstash client does not require connect(); it's stateless HTTP.
    return redisClient;
  }
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}

export { redisClient };
