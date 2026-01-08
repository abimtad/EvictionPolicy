import { caches } from '../cache/index.js';
import { resetMetrics } from '../services/metricsService.js';
import { connectRedis, redisClient } from '../config/redisClient.js';

async function clearRateLimitKeys() {
  try {
    await connectRedis();
    const stream = redisClient.scanIterator({ MATCH: 'rl:*', COUNT: 100 });
    const keys = [];
    for await (const key of stream) {
      keys.push(key);
      if (keys.length >= 100) {
        await redisClient.del(keys);
        keys.length = 0;
      }
    }
    if (keys.length) await redisClient.del(keys);
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
