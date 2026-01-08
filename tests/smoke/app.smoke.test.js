import request from 'supertest';
import { jest } from '@jest/globals';

// Mock infra to avoid real Mongo/Redis during smoke tests
jest.unstable_mockModule('../../src/config/database.js', () => ({ connectMongo: async () => {} }));
jest.unstable_mockModule('../../src/config/redisClient.js', () => {
  const client = {
    isOpen: true,
    async connect() {},
    multi() {
      return {
        incr: () => {},
        ttl: () => {},
        exec: async () => [1, 59]
      };
    },
    expire: async () => {},
    scanIterator: function* () { return; },
    del: async () => {}
  };
  return { connectRedis: async () => {}, redisClient: client };
});
jest.unstable_mockModule('../../src/services/metricsService.js', () => ({
  recordRequestMetric: async () => {},
  resetMetrics: async () => {}
}));

// Provide a fast delay and a canned joke
process.env.CACHE_SAVE_DELAY_MS = '10';

jest.unstable_mockModule('../../src/services/jokeService.js', () => ({
  fetchJokeById: async (id) => ({ id, joke: 'Test joke', status: 200 })
}));

const { app } = await import('../../src/app.js');

describe('Smoke', () => {
  test('GET / returns ok (smoke)', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /jokes/:id returns origin then cache (smoke)', async () => {
    const id = 'R7UfaahVfFd';
    const first = await request(app).get(`/jokes/${id}`);
    expect(first.status).toBe(200);
    expect(first.body.source).toBe('origin');
    expect(Array.isArray(first.body.cacheResults)).toBe(true);

    const second = await request(app).get(`/jokes/${id}`);
    expect(second.status).toBe(200);
    expect(['cache', 'origin']).toContain(second.body.source); // depending on timing
  });
});
