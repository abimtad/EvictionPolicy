import { env } from '../config/env.js';
import { LRUCache } from './lruCache.js';
import { LFUCache } from './lfuCache.js';
import { FIFOCache } from './fifoCache.js';

const capacity = env.cacheCapacity;

const cacheLRU = new LRUCache(capacity);
const cacheLFU = new LFUCache(capacity);
const cacheFIFO = new FIFOCache(capacity);

const caches = [
  { name: 'LRU', instance: cacheLRU },
  { name: 'LFU', instance: cacheLFU },
  { name: 'FIFO', instance: cacheFIFO }
];

export { cacheLRU, cacheLFU, cacheFIFO, caches };
