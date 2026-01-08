import mongoose from 'mongoose';

const CacheResultSchema = new mongoose.Schema(
  {
    strategy: { type: String, required: true },
    hit: { type: Boolean, required: true },
    durationMs: { type: Number, required: true },
    action: { type: String, enum: ['get', 'put'], required: true },
    totals: {
      requests: Number,
      hits: Number,
      misses: Number,
      evictions: Number
    }
  },
  { _id: false }
);

const RequestMetricSchema = new mongoose.Schema(
  {
    jokeId: { type: String, required: true },
    source: { type: String, enum: ['cache', 'origin', 'rate-limit'], required: true },
    cacheResults: [CacheResultSchema],
    rateLimit: {
      allowed: { type: Boolean, default: true },
      windowSeconds: Number,
      maxRequests: Number,
      remaining: Number
    },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: 'request_metrics' }
);

export const RequestMetric = mongoose.model('RequestMetric', RequestMetricSchema);
