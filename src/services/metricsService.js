import { RequestMetric } from '../models/RequestMetric.js';

export async function recordRequestMetric({ jokeId, source, cacheResults, rateLimit }) {
  try {
    const metric = new RequestMetric({ jokeId, source, cacheResults, rateLimit });
    await metric.save();
  } catch (err) {
    console.error('Failed to persist request metric', err.message);
  }
}

export async function resetMetrics() {
  await RequestMetric.deleteMany({});
}
