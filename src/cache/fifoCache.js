import { DoublyLinkedList, ListNode } from './doublyLinkedList.js';

class FIFOCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.queue = new DoublyLinkedList();
    this.requests = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  get(key) {
    this.requests += 1;
    const node = this.map.get(key);
    if (!node) {
      this.misses += 1;
      return undefined;
    }
    this.hits += 1;
    return node.value;
  }

  put(key, value) {
    if (this.capacity === 0) return null;

    let node = this.map.get(key);
    if (node) {
      node.value = value;
      return null;
    }

    if (this.map.size >= this.capacity) {
      const evicted = this.queue.removeTail();
      if (evicted) {
        this.map.delete(evicted.key);
        this.evictions += 1;
      }
    }

    node = new ListNode(key, value);
    this.queue.addToFront(node);
    this.map.set(key, node);
    return null;
  }

  stats() {
    return {
      strategy: 'FIFO',
      requests: this.requests,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions
    };
  }

  clear() {
    this.map.clear();
    this.queue = new DoublyLinkedList();
    this.requests = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }
}

export { FIFOCache };
