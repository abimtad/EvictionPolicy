import { caches } from '../cache/index.js';
import { fetchJokeById } from '../services/jokeService.js';
import { recordRequestMetric } from '../services/metricsService.js';
import { delay, measureAsync, nowMs } from '../utils/time.js';
import { env } from '../config/env.js';

const CACHE_SAVE_DELAY_MS = Number(process.env.CACHE_SAVE_DELAY_MS || env.cacheSaveDelayMs);

export async function getJokeController(req, res) {
  try {
    const jokeId = req.jokeId || req.params.jokeId;
    const rateLimit = req.rateLimitInfo || { allowed: true };
    const cacheResults = req.cacheResults || [];

    const { result: jokeData, durationMs: fetchDurationMs } = await measureAsync(() =>
      fetchJokeById(jokeId)
    );

    const savePromises = caches.map(({ name, instance }) =>
      (async () => {
        const start = nowMs();
        await delay(CACHE_SAVE_DELAY_MS);
        instance.put(jokeId, jokeData);
        const durationMs = nowMs() - start;
        const totals = instance.stats();
        return { strategy: name, hit: false, durationMs, action: 'put', totals };
      })()
    );

    const saveResults = await Promise.all(savePromises);
    const mergedCacheResults = [...(cacheResults || []), ...saveResults];

    await recordRequestMetric({
      jokeId,
      source: 'origin',
      cacheResults: mergedCacheResults,
      rateLimit
    });

    return res.json({
      source: 'origin',
      joke: jokeData,
      fetchDurationMs,
      cacheResults: mergedCacheResults,
      rateLimit
    });
  } catch (err) {
    console.error('Joke fetch failed', err.message);
    return res.status(500).json({ message: 'Failed to fetch dad joke', error: err.message });
  }
}
