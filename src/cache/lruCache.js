import { DoublyLinkedList, ListNode } from './doublyLinkedList.js';

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.list = new DoublyLinkedList();
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
    this.list.removeNode(node);
    this.list.addToFront(node);
    return node.value;
  }

  put(key, value) {
    if (this.capacity === 0) return null;

    let node = this.map.get(key);
    if (node) {
      node.value = value;
      this.list.removeNode(node);
      this.list.addToFront(node);
      return null;
    }

    if (this.map.size >= this.capacity) {
      const evicted = this.list.removeTail();
      if (evicted) {
        this.map.delete(evicted.key);
        this.evictions += 1;
      }
    }

    node = new ListNode(key, value);
    this.list.addToFront(node);
    this.map.set(key, node);
    return null;
  }

  stats() {
    return {
      strategy: 'LRU',
      requests: this.requests,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions
    };
  }

  clear() {
    this.map.clear();
    this.list = new DoublyLinkedList();
    this.requests = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }
}

export { LRUCache };
