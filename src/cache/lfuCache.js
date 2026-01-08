import { DoublyLinkedList, ListNode } from './doublyLinkedList.js';

class LFUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.size = 0;
    this.nodeMap = new Map();
    this.freqMap = new Map();
    this.minFreq = 0;
    this.requests = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  _touch(node) {
    const oldFreq = node.freq;
    const oldList = this.freqMap.get(oldFreq);
    oldList.removeNode(node);
    if (oldList.isEmpty()) {
      this.freqMap.delete(oldFreq);
      if (this.minFreq === oldFreq) this.minFreq += 1;
    }

    node.freq += 1;
    const newList = this.freqMap.get(node.freq) || new DoublyLinkedList();
    newList.addToFront(node);
    this.freqMap.set(node.freq, newList);
  }

  get(key) {
    this.requests += 1;
    const node = this.nodeMap.get(key);
    if (!node) {
      this.misses += 1;
      return undefined;
    }
    this.hits += 1;
    this._touch(node);
    return node.value;
  }

  put(key, value) {
    if (this.capacity === 0) return null;

    if (this.nodeMap.has(key)) {
      const node = this.nodeMap.get(key);
      node.value = value;
      this._touch(node);
      return null;
    }

    if (this.size >= this.capacity) {
      const list = this.freqMap.get(this.minFreq);
      const evicted = list.removeTail();
      if (evicted) {
        this.nodeMap.delete(evicted.key);
        this.evictions += 1;
        this.size -= 1;
      }
      if (list.isEmpty()) this.freqMap.delete(this.minFreq);
    }

    const newNode = new ListNode(key, value, 1);
    const freqOneList = this.freqMap.get(1) || new DoublyLinkedList();
    freqOneList.addToFront(newNode);
    this.freqMap.set(1, freqOneList);

    this.nodeMap.set(key, newNode);
    this.size += 1;
    this.minFreq = 1;
    return null;
  }

  stats() {
    return {
      strategy: 'LFU',
      requests: this.requests,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions
    };
  }

  clear() {
    this.size = 0;
    this.nodeMap.clear();
    this.freqMap.clear();
    this.minFreq = 0;
    this.requests = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }
}

export { LFUCache };
