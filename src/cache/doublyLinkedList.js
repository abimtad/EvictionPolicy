class ListNode {
  constructor(key, value, freq = 1) {
    this.key = key;
    this.value = value;
    this.freq = freq;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = new ListNode(null, null);
    this.tail = new ListNode(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  isEmpty() {
    return this.size === 0;
  }

  addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
    this.size += 1;
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    node.prev = null;
    node.next = null;
    this.size -= 1;
  }

  removeTail() {
    if (this.isEmpty()) return null;
    const node = this.tail.prev;
    this.removeNode(node);
    return node;
  }
}

export { ListNode, DoublyLinkedList };
