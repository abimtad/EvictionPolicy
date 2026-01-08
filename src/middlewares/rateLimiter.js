import { env } from '../config/env.js';
import { connectRedis, redisClient } from '../config/redisClient.js';
import { recordRequestMetric } from '../services/metricsService.js';

export async function rateLimiter(req, res, next) {
  const windowSeconds = env.rateLimit.windowSeconds;
  const maxRequests = env.rateLimit.maxRequests;
  const key = `rl:${req.ip}:${req.baseUrl}${req.path}`;

  try {
    await connectRedis();

    const multi = redisClient.multi();
    multi.incr(key);
    multi.ttl(key);
    const execRes = await multi.exec();
    let [count, ttl] = execRes || [];
    // Support both raw numbers and legacy [err, val] tuples
    if (Array.isArray(count)) count = count[1];
    if (Array.isArray(ttl)) ttl = ttl[1];

    if (ttl < 0) {
      await redisClient.expire(key, windowSeconds);
      ttl = windowSeconds;
    }

    const remaining = Math.max(maxRequests - Number(count), 0);

    if (Number(count) > maxRequests) {
      const retryAfter = ttl > 0 ? ttl : windowSeconds;
      await recordRequestMetric({
        jokeId: req.jokeId,
        source: 'rate-limit',
        cacheResults: req.cacheResults || [],
        rateLimit: {
          allowed: false,
          windowSeconds,
          maxRequests,
          remaining
        }
      });

      return res.status(429).json({
        message: 'Rate limit exceeded',
        retryAfterSeconds: retryAfter,
        remaining
      });
    }

    req.rateLimitInfo = { allowed: true, windowSeconds, maxRequests, remaining };
    return next();
  } catch (err) {
    console.error('Rate limiter failure, allowing request', err.message);
    req.rateLimitInfo = { allowed: true, degraded: true, windowSeconds, maxRequests };
    return next();
  }
}
