import { caches } from '../cache/index.js';
import { resetMetrics } from '../services/metricsService.js';
import { connectRedis, redisClient } from '../config/redisClient.js';

async function clearRateLimitKeys() {
  try {
    await connectRedis();
    const match = 'rl:*';
    const batch = 100;

    if (typeof redisClient.scanIterator === 'function') {
      // node-redis iterator API
      const stream = redisClient.scanIterator({ MATCH: match, COUNT: batch });
      const keys = [];
      for await (const key of stream) {
        keys.push(key);
        if (keys.length >= batch) {
          await redisClient.del(...keys);
          keys.length = 0;
        }
      }
      if (keys.length) await redisClient.del(...keys);
    } else if (typeof redisClient.scan === 'function') {
      // Upstash or generic SCAN loop
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redisClient.scan(cursor, { match, count: batch });
        if (keys && keys.length) {
          await redisClient.del(...keys);
        }
        cursor = Number(nextCursor);
      } while (cursor !== 0);
    }
  } catch (err) {
    console.error('Unable to clear rate limit keys', err.message);
  }
}

export async function resetController(req, res) {
  try {
    caches.forEach(({ instance }) => instance.clear());
    await resetMetrics();
    await clearRateLimitKeys();
    return res.json({ message: 'Caches, metrics, and rate limit counters reset.' });
  } catch (err) {
    console.error('Reset failed', err.message);
    return res.status(500).json({ message: 'Reset failed', error: err.message });
  }
}
