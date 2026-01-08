import { caches } from '../cache/index.js';
import { recordRequestMetric } from '../services/metricsService.js';
import { measure } from '../utils/time.js';

export async function cacheMiddleware(req, res, next) {
  const jokeId = req.params.jokeId || req.params.id || req.query.jokeId;
  req.jokeId = jokeId;

  const cacheResults = [];
  let cachedValue;

  for (const { name, instance } of caches) {
    const { result, durationMs } = measure(() => instance.get(jokeId));
    const hit = result !== undefined;
    cacheResults.push({
      strategy: name,
      hit,
      durationMs,
      action: 'get',
      totals: instance.stats()
    });

    if (hit && cachedValue === undefined) {
      cachedValue = result;
    }
  }

  if (cachedValue !== undefined) {
    await recordRequestMetric({
      jokeId,
      source: 'cache',
      cacheResults,
      rateLimit: { allowed: true }
    });

    return res.json({
      source: 'cache',
      joke: cachedValue,
      cacheResults
    });
  }

  req.cacheResults = cacheResults;
  return next();
}
