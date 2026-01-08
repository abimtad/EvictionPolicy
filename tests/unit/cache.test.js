import { LRUCache } from '../../src/cache/lruCache.js';
import { LFUCache } from '../../src/cache/lfuCache.js';
import { FIFOCache } from '../../src/cache/fifoCache.js';

describe('Cache strategies (unit)', () => {
  test('LRU evicts least recently used', () => {
    const c = new LRUCache(2);
    c.put('a', 1);
    c.put('b', 2);
    expect(c.get('a')).toBe(1); // a becomes MRU
    c.put('c', 3); // evict b
    expect(c.get('b')).toBeUndefined();
    expect(c.get('a')).toBe(1);
    expect(c.get('c')).toBe(3);
  });

  test('LFU evicts least frequently used, ties by LRU', () => {
    const c = new LFUCache(2);
    c.put('a', 1);
    c.put('b', 2);
    c.get('a'); // a freq=2
    c.put('c', 3); // evict b (freq=1)
    expect(c.get('b')).toBeUndefined();
    expect(c.get('a')).toBe(1);
    expect(c.get('c')).toBe(3);
  });

  test('FIFO evicts first inserted', () => {
    const c = new FIFOCache(2);
    c.put('a', 1);
    c.put('b', 2);
    c.put('c', 3); // evict a
    expect(c.get('a')).toBeUndefined();
    expect(c.get('b')).toBe(2);
    expect(c.get('c')).toBe(3);
  });
});
