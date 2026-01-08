import request from 'supertest';
import { jest } from '@jest/globals';

// In integration tests, simulate Redis fixed window in-memory to validate limiter behavior
const windowSeconds = 60;
const maxRequests = 5;
const rlStore = new Map();

jest.unstable_mockModule('../../src/config/database.js', () => ({ connectMongo: async () => {} }));
jest.unstable_mockModule('../../src/config/redisClient.js', () => {
  const now = () => Math.floor(Date.now() / 1000);
  const client = {
    isOpen: true,
    async connect() {},
    multi() {
      const ops = [];
      return {
        incr: (key) => ops.push({ op: 'incr', key }),
        ttl: (key) => ops.push({ op: 'ttl', key }),
        exec: async () => {
          let countVal = 0;
          let ttlVal = -2;
          for (const o of ops) {
            if (o.op === 'incr') {
              const rec = rlStore.get(o.key);
              const ts = now();
              if (!rec || rec.resetAt <= ts) {
                rlStore.set(o.key, { count: 1, resetAt: ts + windowSeconds });
              } else {
                rec.count += 1;
              }
              countVal = rlStore.get(o.key).count;
            } else if (o.op === 'ttl') {
              const rec = rlStore.get(o.key);
              if (!rec) ttlVal = -2;
              else ttlVal = Math.max(rec.resetAt - now(), 0);
            }
          }
          ops.length = 0;
          return [countVal, ttlVal];
        },
        expire: async (key, secs) => {
          const ts = now();
          const rec = rlStore.get(key) || { count: 0, resetAt: ts + secs };
          rec.resetAt = ts + secs;
          rlStore.set(key, rec);
        }
      };
    },
    scanIterator: function* () { return; },
    del: async () => {}
  };
  return { connectRedis: async () => {}, redisClient: client };
});

// Force cache misses so rate limiter is always evaluated
jest.unstable_mockModule('../../src/cache/index.js', () => {
  const makeStub = (name) => ({
    name,
    instance: {
      get: () => undefined,
      put: () => null,
      stats: () => ({ strategy: name, requests: 0, hits: 0, misses: 0, evictions: 0 }),
      clear: () => {}
    }
  });
  return { caches: [makeStub('LRU'), makeStub('LFU'), makeStub('FIFO')] };
});

jest.unstable_mockModule('../../src/services/metricsService.js', () => ({
  recordRequestMetric: async () => {},
  resetMetrics: async () => {}
}));

process.env.CACHE_SAVE_DELAY_MS = '5';

jest.unstable_mockModule('../../src/services/jokeService.js', () => ({
  fetchJokeById: async (id) => ({ id, joke: `Joke ${id}`, status: 200 })
}));

const { app } = await import('../../src/app.js');

describe('Integration - jokes flow', () => {
  test('rate limiting enforces maxRequests per window', async () => {
    const id = 'rateLimitTest';
    const results = [];
    for (let i = 0; i < maxRequests + 1; i++) {
      // supertest uses 127.0.0.1; limiter key also uses path, so it accumulates
      const res = await request(app).get(`/jokes/${id}`);
      results.push(res.status);
    }
    const codes = results.reduce((m, c) => ((m[c] = (m[c] || 0) + 1), m), {});
    expect(codes[200]).toBe(maxRequests);
    expect(codes[429]).toBe(1);
  });
});
