/**
 * Queue ADT (Linked List) Engine & Step History Manager
 * Manages the underlying linked list queue structure and records discrete animation steps.
 */

class QueueEngine {
  constructor() {
    this.queue = []; // Array of nodes representing linked list from FRONT (index 0) to REAR (last index)
    this.nodeCounter = 0;
    this.historySteps = [];
    this.currentStepIndex = 0;
    
    this.totalEnqueues = 0;
    this.totalDequeues = 0;

    // C++ Code Line Mappings
    this.cppLines = {
      ENQUEUE_ALLOC: 2,       // Node* newNode = new Node(); newNode->data = val; newNode->next = nullptr;
      ENQUEUE_FIRST_CHECK: 3, // if (front == nullptr) front = rear = newNode;
      ENQUEUE_CONNECT: 4,     // rear->next = newNode;
      ENQUEUE_UPDATE_REAR: 5, // rear = newNode;

      DEQUEUE_CHECK_EMPTY: 8, // if (front == nullptr) return;
      DEQUEUE_TEMP: 9,        // Node* temp = front;
      DEQUEUE_MOVE_FRONT: 10, // front = front->next;
      DEQUEUE_DELETE: 11,     // delete temp;
      DEQUEUE_RESET_REAR: 12, // if (front == nullptr) rear = nullptr;

      PEEK_CHECK: 15,         // if (front == nullptr) return -1;
      PEEK_RETURN: 16,        // return front->data;

      ISEMPTY_CHECK: 19,      // return front == nullptr;

      CLEAR_LOOP: 22          // while (front != nullptr) dequeue();
    };
  }

  reset() {
    this.queue = [];
    this.nodeCounter = 0;
    this.historySteps = [];
    this.currentStepIndex = 0;
    this.totalEnqueues = 0;
    this.totalDequeues = 0;

    this.recordStep({
      opName: 'INITIAL',
      description: 'Queue initialized as empty. FRONT = NULL, REAR = NULL.',
      codeLine: 1,
      operationDetail: { action: 'Initialize', value: 'NULL', resultMessage: 'Queue Empty', statusType: 'amber' }
    });
  }

  getCurrentSnapshot() {
    const frontNode = this.queue.length > 0 ? this.queue[0] : null;
    const rearNode = this.queue.length > 0 ? this.queue[this.queue.length - 1] : null;

    return {
      nodes: this.queue.map((n, idx) => ({
        id: n.id,
        data: n.data,
        nextId: idx < this.queue.length - 1 ? this.queue[idx + 1].id : null,
        nextVal: idx < this.queue.length - 1 ? this.queue[idx + 1].data : 'NULL'
      })),
      size: this.queue.length,
      frontVal: frontNode ? frontNode.data : 'NULL',
      frontId: frontNode ? frontNode.id : null,
      rearVal: rearNode ? rearNode.data : 'NULL',
      rearId: rearNode ? rearNode.id : null,
      isEmpty: this.queue.length === 0,
      totalEnqueues: this.totalEnqueues,
      totalDequeues: this.totalDequeues
    };
  }

  recordStep(config) {
    const snap = this.getCurrentSnapshot();
    const step = {
      stepIndex: this.historySteps.length + 1,
      opName: config.opName || 'STEP',
      nodes: config.customNodes || snap.nodes,
      frontId: config.customFrontId !== undefined ? config.customFrontId : snap.frontId,
      rearId: config.customRearId !== undefined ? config.customRearId : snap.rearId,
      highlightNodeId: config.highlightNodeId || null,
      dequeueNodeId: config.dequeueNodeId || null,
      peekNodeId: config.peekNodeId || null,
      newNodeId: config.newNodeId || null,
      codeLine: config.codeLine || 1,
      description: config.description || '',
      stats: {
        size: config.customSize !== undefined ? config.customSize : snap.size,
        frontVal: config.customFrontVal !== undefined ? config.customFrontVal : snap.frontVal,
        rearVal: config.customRearVal !== undefined ? config.customRearVal : snap.rearVal,
        isEmpty: config.customIsEmpty !== undefined ? config.customIsEmpty : snap.isEmpty,
        totalEnqueues: snap.totalEnqueues,
        totalDequeues: snap.totalDequeues
      },
      operationDetail: config.operationDetail || { action: 'Idle', value: '-', resultMessage: 'Ready', statusType: 'success' }
    };
    this.historySteps.push(step);
  }

  // Enqueue Operation (3 sub-steps)
  enqueue(value) {
    this.nodeCounter++;
    const newNode = {
      id: `node-${this.nodeCounter}`,
      data: value
    };
    this.totalEnqueues++;

    const isFirst = this.queue.length === 0;
    const oldRearNode = !isFirst ? this.queue[this.queue.length - 1] : null;

    // Step 1: Allocate memory & set data
    const tempNodesStep1 = [
      ...this.getCurrentSnapshot().nodes,
      { id: newNode.id, data: newNode.data, nextId: null, nextVal: 'NULL', isNew: true }
    ];

    this.recordStep({
      opName: 'ENQUEUE',
      newNodeId: newNode.id,
      customNodes: tempNodesStep1,
      codeLine: this.cppLines.ENQUEUE_ALLOC,
      description: `Step 1: Allocated new Node(${value}) with next = NULL.`,
      operationDetail: { action: 'Enqueue: Allocate', value: value, resultMessage: `Allocated Node(${value})`, statusType: 'amber' }
    });

    if (isFirst) {
      // First Enqueue Special Case: front = rear = newNode
      this.queue.push(newNode);

      this.recordStep({
        opName: 'ENQUEUE',
        newNodeId: newNode.id,
        highlightNodeId: newNode.id,
        customFrontId: newNode.id,
        customRearId: newNode.id,
        codeLine: this.cppLines.ENQUEUE_FIRST_CHECK,
        description: `Step 2: Queue was empty. Set both FRONT and REAR pointers to point to Node(${value}).`,
        operationDetail: { action: 'Enqueue: First Node', value: value, resultMessage: `FRONT & REAR -> ${value}`, statusType: 'success' }
      });

    } else {
      // Step 2: Connect old rear->next = newNode
      const tempNodesStep2 = this.getCurrentSnapshot().nodes.map(n => {
        if (n.id === oldRearNode.id) {
          return { ...n, nextId: newNode.id, nextVal: newNode.data };
        }
        return n;
      });
      tempNodesStep2.push({ id: newNode.id, data: newNode.data, nextId: null, nextVal: 'NULL' });

      this.recordStep({
        opName: 'ENQUEUE',
        newNodeId: newNode.id,
        customNodes: tempNodesStep2,
        codeLine: this.cppLines.ENQUEUE_CONNECT,
        description: `Step 2: Linked current REAR node's (${oldRearNode.data}) next pointer to new Node(${value}).`,
        operationDetail: { action: 'Enqueue: Connect', value: value, resultMessage: `Linked ${oldRearNode.data} -> ${value}`, statusType: 'amber' }
      });

      // Step 3: Shift rear = newNode
      this.queue.push(newNode);

      this.recordStep({
        opName: 'ENQUEUE',
        newNodeId: newNode.id,
        highlightNodeId: newNode.id,
        customRearId: newNode.id,
        codeLine: this.cppLines.ENQUEUE_UPDATE_REAR,
        description: `Step 3: Updated REAR pointer to point to new Node(${value}). Enqueue complete.`,
        operationDetail: { action: 'Enqueue: Success', value: value, resultMessage: `Enqueued ${value}`, statusType: 'success' }
      });
    }
  }

  // Dequeue Operation (3 to 4 sub-steps)
  dequeue() {
    if (this.queue.length === 0) {
      this.recordStep({
        opName: 'DEQUEUE',
        codeLine: this.cppLines.DEQUEUE_CHECK_EMPTY,
        description: 'Queue Underflow! Cannot dequeue from an empty queue (front == NULL).',
        operationDetail: { action: 'Dequeue: Underflow', value: 'NONE', resultMessage: 'Queue Underflow!', statusType: 'danger' }
      });
      return false;
    }

    this.totalDequeues++;
    const dequeuedNode = this.queue[0];
    const nextFrontNode = this.queue.length > 1 ? this.queue[1] : null;

    // Step 1: Identify FRONT node with temp pointer
    this.recordStep({
      opName: 'DEQUEUE',
      dequeueNodeId: dequeuedNode.id,
      highlightNodeId: dequeuedNode.id,
      codeLine: this.cppLines.DEQUEUE_TEMP,
      description: `Step 1: Stored current FRONT node Node(${dequeuedNode.data}) in temporary pointer temp.`,
      operationDetail: { action: 'Dequeue: Target', value: dequeuedNode.data, resultMessage: `Targeting FRONT (${dequeuedNode.data})`, statusType: 'amber' }
    });

    // Step 2: Move front = front->next
    this.recordStep({
      opName: 'DEQUEUE',
      dequeueNodeId: dequeuedNode.id,
      customFrontId: nextFrontNode ? nextFrontNode.id : null,
      customFrontVal: nextFrontNode ? nextFrontNode.data : 'NULL',
      customSize: this.queue.length - 1,
      customIsEmpty: this.queue.length - 1 === 0,
      codeLine: this.cppLines.DEQUEUE_MOVE_FRONT,
      description: `Step 2: Shifted FRONT pointer to next node (${nextFrontNode ? nextFrontNode.data : 'NULL'}).`,
      operationDetail: { action: 'Dequeue: Move FRONT', value: dequeuedNode.data, resultMessage: `FRONT shifted -> ${nextFrontNode ? nextFrontNode.data : 'NULL'}`, statusType: 'amber' }
    });

    // Step 3: Delete temp node
    this.queue.shift();

    if (this.queue.length === 0) {
      // Last Dequeue Special Case: rear = null
      this.recordStep({
        opName: 'DEQUEUE',
        customFrontId: null,
        customRearId: null,
        customFrontVal: 'NULL',
        customRearVal: 'NULL',
        codeLine: this.cppLines.DEQUEUE_RESET_REAR,
        description: `Step 3: Deallocated Node(${dequeuedNode.data}). Queue is now empty. Set REAR = NULL.`,
        operationDetail: { action: 'Dequeue: Last Node', value: dequeuedNode.data, resultMessage: `Dequeued ${dequeuedNode.data} (Empty)`, statusType: 'danger' }
      });
    } else {
      this.recordStep({
        opName: 'DEQUEUE',
        codeLine: this.cppLines.DEQUEUE_DELETE,
        description: `Step 3: Deallocated Node(${dequeuedNode.data}) memory. Dequeue complete.`,
        operationDetail: { action: 'Dequeue: Success', value: dequeuedNode.data, resultMessage: `Dequeued ${dequeuedNode.data}`, statusType: 'danger' }
      });
    }

    return true;
  }

  // Peek Operation (1 step)
  peek() {
    if (this.queue.length === 0) {
      this.recordStep({
        opName: 'PEEK',
        codeLine: this.cppLines.PEEK_CHECK,
        description: 'Queue is Empty! Peek returned NULL.',
        operationDetail: { action: 'Peek: Empty', value: 'NULL', resultMessage: 'Queue is Empty', statusType: 'amber' }
      });
      return null;
    }

    const frontNode = this.queue[0];
    this.recordStep({
      opName: 'PEEK',
      peekNodeId: frontNode.id,
      codeLine: this.cppLines.PEEK_RETURN,
      description: `Peeked FRONT element. Value is ${frontNode.data}. Queue unchanged.`,
      operationDetail: { action: 'Peek: FRONT', value: frontNode.data, resultMessage: `FRONT = ${frontNode.data}`, statusType: 'amber' }
    });
    return frontNode.data;
  }

  // IsEmpty Operation (1 step)
  isEmpty() {
    const isEmp = this.queue.length === 0;
    this.recordStep({
      opName: 'ISEMPTY',
      codeLine: this.cppLines.ISEMPTY_CHECK,
      description: `Checked if FRONT == NULL. Result: ${isEmp ? 'TRUE (Queue is Empty)' : 'FALSE (Queue is Not Empty)'}.`,
      operationDetail: { action: 'IsEmpty Check', value: isEmp ? 'TRUE' : 'FALSE', resultMessage: isEmp ? 'Empty' : 'Not Empty', statusType: isEmp ? 'amber' : 'success' }
    });
    return isEmp;
  }

  // Clear Operation
  clear() {
    if (this.queue.length === 0) {
      this.recordStep({
        opName: 'CLEAR',
        codeLine: this.cppLines.CLEAR_LOOP,
        description: 'Queue is already empty.',
        operationDetail: { action: 'Clear', value: '0 items', resultMessage: 'Already Empty', statusType: 'amber' }
      });
      return;
    }

    this.recordStep({
      opName: 'CLEAR',
      codeLine: this.cppLines.CLEAR_LOOP,
      description: `Initiating Clear operation on ${this.queue.length} nodes...`,
      operationDetail: { action: 'Clear: Start', value: `${this.queue.length} nodes`, resultMessage: 'Clearing All', statusType: 'amber' }
    });

    while (this.queue.length > 0) {
      this.dequeue();
    }

    this.recordStep({
      opName: 'CLEAR',
      codeLine: this.cppLines.CLEAR_LOOP,
      description: 'Queue cleared successfully. FRONT and REAR reset to NULL.',
      operationDetail: { action: 'Clear: Complete', value: '0 items', resultMessage: 'Queue Cleared', statusType: 'success' }
    });
  }

  getStep(index) {
    if (index < 0 || index >= this.historySteps.length) return null;
    return this.historySteps[index];
  }

  getTotalSteps() {
    return this.historySteps.length;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QueueEngine;
}
