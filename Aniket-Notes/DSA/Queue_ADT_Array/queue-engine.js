/**
 * Queue ADT (Array Implementation) Engine & Step History Manager
 * Manages fixed-size array queue (capacity 5), FRONT/REAR pointers, and records step snapshots.
 */

class QueueEngine {
  constructor(capacity = 5) {
    this.capacity = capacity;
    this.array = new Array(capacity).fill(null);
    this.front = -1;
    this.rear = -1;

    this.historySteps = [];
    this.currentStepIndex = 0;

    this.totalEnqueues = 0;
    this.totalDequeues = 0;

    // C++ Code Line Mappings
    this.cppLines = {
      ENQUEUE_CHECK_FULL: 2,   // if (rear == 4) return;
      ENQUEUE_INIT_FRONT: 3,   // if (front == -1) front = 0;
      ENQUEUE_MOVE_REAR: 4,    // rear++;
      ENQUEUE_INSERT: 5,       // a[rear] = value;

      DEQUEUE_CHECK_EMPTY: 8,  // if (front == -1 || front > rear) return;
      DEQUEUE_READ: 9,         // int val = a[front];
      DEQUEUE_MOVE_FRONT: 10,  // front++;
      DEQUEUE_RESET_CHECK: 11, // if (front > rear) { front = -1; rear = -1; }

      PEEK_CHECK: 14,          // if (front == -1) return;
      PEEK_RETURN: 15,         // return a[front];

      ISEMPTY_CHECK: 18,       // return front == -1;

      ISFULL_CHECK: 21,        // return rear == 4;

      CLEAR_RESET: 24          // front = -1; rear = -1;
    };
  }

  reset() {
    this.array = new Array(this.capacity).fill(null);
    this.front = -1;
    this.rear = -1;
    this.historySteps = [];
    this.currentStepIndex = 0;
    this.totalEnqueues = 0;
    this.totalDequeues = 0;

    this.recordStep({
      opName: 'INITIAL',
      codeLine: 1,
      description: 'Queue initialized as empty. FRONT = -1, REAR = -1.',
      operationDetail: { action: 'Initialize', value: 'None', resultMessage: 'Queue Empty', statusType: 'amber' }
    });
  }

  getCurrentSnapshot() {
    const occupiedCount = (this.front !== -1 && this.rear >= this.front) 
      ? (this.rear - this.front + 1) 
      : 0;

    const frontVal = (this.front !== -1 && this.front <= this.rear) ? this.array[this.front] : 'NULL';
    const rearVal = (this.rear !== -1 && this.rear >= this.front) ? this.array[this.rear] : 'NULL';

    return {
      array: [...this.array],
      front: this.front,
      rear: this.rear,
      capacity: this.capacity,
      size: occupiedCount,
      frontVal: frontVal,
      rearVal: rearVal,
      isEmpty: this.front === -1 || this.front > this.rear,
      isFull: this.rear === this.capacity - 1,
      hasLinearLimitation: this.rear === this.capacity - 1 && this.front > 0,
      totalEnqueues: this.totalEnqueues,
      totalDequeues: this.totalDequeues
    };
  }

  recordStep(config) {
    const snap = this.getCurrentSnapshot();
    const step = {
      stepIndex: this.historySteps.length + 1,
      opName: config.opName || 'STEP',
      array: config.customArray ? [...config.customArray] : snap.array,
      front: config.customFront !== undefined ? config.customFront : snap.front,
      rear: config.customRear !== undefined ? config.customRear : snap.rear,
      highlightIndex: config.highlightIndex !== undefined ? config.highlightIndex : null,
      peekIndex: config.peekIndex !== undefined ? config.peekIndex : null,
      dequeueIndex: config.dequeueIndex !== undefined ? config.dequeueIndex : null,
      codeLine: config.codeLine || 1,
      description: config.description || '',
      stats: {
        capacity: snap.capacity,
        size: config.customSize !== undefined ? config.customSize : snap.size,
        frontIndex: config.customFront !== undefined ? config.customFront : snap.front,
        rearIndex: config.customRear !== undefined ? config.customRear : snap.rear,
        frontVal: config.customFrontVal !== undefined ? config.customFrontVal : snap.frontVal,
        rearVal: config.customRearVal !== undefined ? config.customRearVal : snap.rearVal,
        isEmpty: config.customIsEmpty !== undefined ? config.customIsEmpty : snap.isEmpty,
        isFull: config.customIsFull !== undefined ? config.customIsFull : snap.isFull,
        hasLinearLimitation: snap.hasLinearLimitation,
        totalEnqueues: snap.totalEnqueues,
        totalDequeues: snap.totalDequeues
      },
      operationDetail: config.operationDetail || { action: 'Idle', value: '-', resultMessage: 'Ready', statusType: 'success' }
    };
    this.historySteps.push(step);
  }

  // Enqueue Operation (3 to 4 sub-steps)
  enqueue(value) {
    // Step 1: Check if Full
    if (this.rear === this.capacity - 1) {
      const isWasted = this.front > 0;
      this.recordStep({
        opName: 'ENQUEUE',
        codeLine: this.cppLines.ENQUEUE_CHECK_FULL,
        description: isWasted 
          ? `Queue Overflow! REAR is at index ${this.rear}. Slots 0 to ${this.front - 1} are empty but un-reusable in a simple linear array queue.`
          : `Queue Overflow! Queue is completely full (REAR = ${this.rear}).`,
        operationDetail: { action: 'Enqueue: Overflow', value: value, resultMessage: 'Queue Overflow!', statusType: 'danger' }
      });
      return false;
    }

    this.totalEnqueues++;

    // Step 1: Check Full (Passed)
    this.recordStep({
      opName: 'ENQUEUE',
      codeLine: this.cppLines.ENQUEUE_CHECK_FULL,
      description: `Step 1: Check if rear == ${this.capacity - 1}. REAR is at index ${this.rear}. Space is available.`,
      operationDetail: { action: 'Enqueue: Check Capacity', value: value, resultMessage: 'Space Available', statusType: 'amber' }
    });

    // Step 2: Initialize FRONT if first element
    if (this.front === -1) {
      this.front = 0;
      this.recordStep({
        opName: 'ENQUEUE',
        codeLine: this.cppLines.ENQUEUE_INIT_FRONT,
        description: `Step 2: Queue was empty. Set FRONT = 0.`,
        operationDetail: { action: 'Enqueue: Set FRONT', value: value, resultMessage: 'FRONT = 0', statusType: 'amber' }
      });
    }

    // Step 3: Increment REAR
    this.rear++;
    this.recordStep({
      opName: 'ENQUEUE',
      codeLine: this.cppLines.ENQUEUE_MOVE_REAR,
      description: `Step 3: Incremented REAR pointer to index ${this.rear}.`,
      operationDetail: { action: 'Enqueue: Move REAR', value: value, resultMessage: `REAR = ${this.rear}`, statusType: 'amber' }
    });

    // Step 4: Insert value
    this.array[this.rear] = value;
    this.recordStep({
      opName: 'ENQUEUE',
      highlightIndex: this.rear,
      codeLine: this.cppLines.ENQUEUE_INSERT,
      description: `Step 4: Inserted value ${value} at index ${this.rear}. Enqueue complete.`,
      operationDetail: { action: 'Enqueue: Success', value: value, resultMessage: `Enqueued ${value}`, statusType: 'success' }
    });

    return true;
  }

  // Dequeue Operation (3 to 4 sub-steps)
  dequeue() {
    // Check if Empty
    if (this.front === -1 || this.front > this.rear) {
      this.recordStep({
        opName: 'DEQUEUE',
        codeLine: this.cppLines.DEQUEUE_CHECK_EMPTY,
        description: 'Queue Underflow! Cannot dequeue from an empty queue.',
        operationDetail: { action: 'Dequeue: Underflow', value: 'NONE', resultMessage: 'Queue Underflow!', statusType: 'danger' }
      });
      return false;
    }

    this.totalDequeues++;
    const poppedVal = this.array[this.front];

    // Step 1: Check Empty & Identify FRONT
    this.recordStep({
      opName: 'DEQUEUE',
      dequeueIndex: this.front,
      codeLine: this.cppLines.DEQUEUE_READ,
      description: `Step 1: Targeted FRONT element (${poppedVal}) at index ${this.front}.`,
      operationDetail: { action: 'Dequeue: Target', value: poppedVal, resultMessage: `FRONT value = ${poppedVal}`, statusType: 'amber' }
    });

    // Step 2: Clear value slot & Increment FRONT
    this.array[this.front] = null; // Clear slot visually
    const oldFront = this.front;
    this.front++;

    // Check if Queue becomes empty
    if (this.front > this.rear) {
      this.front = -1;
      this.rear = -1;

      this.recordStep({
        opName: 'DEQUEUE',
        codeLine: this.cppLines.DEQUEUE_RESET_CHECK,
        description: `Step 2: Removed element ${poppedVal}. Queue is now empty. Reset FRONT = -1, REAR = -1.`,
        operationDetail: { action: 'Dequeue: Reset', value: poppedVal, resultMessage: `Dequeued ${poppedVal} (Queue Empty)`, statusType: 'danger' }
      });
    } else {
      this.recordStep({
        opName: 'DEQUEUE',
        codeLine: this.cppLines.DEQUEUE_MOVE_FRONT,
        description: `Step 2: Removed element ${poppedVal}. Incremented FRONT pointer to index ${this.front}.`,
        operationDetail: { action: 'Dequeue: Move FRONT', value: poppedVal, resultMessage: `Dequeued ${poppedVal} (FRONT = ${this.front})`, statusType: 'danger' }
      });
    }

    return true;
  }

  // Peek Operation (1 step)
  peek() {
    if (this.front === -1 || this.front > this.rear) {
      this.recordStep({
        opName: 'PEEK',
        codeLine: this.cppLines.PEEK_CHECK,
        description: 'Queue is Empty! Peek returned NULL.',
        operationDetail: { action: 'Peek: Empty', value: 'NULL', resultMessage: 'Queue is Empty', statusType: 'amber' }
      });
      return null;
    }

    const frontVal = this.array[this.front];
    this.recordStep({
      opName: 'PEEK',
      peekIndex: this.front,
      codeLine: this.cppLines.PEEK_RETURN,
      description: `Peeked FRONT element at index ${this.front}. Value is ${frontVal}.`,
      operationDetail: { action: 'Peek: FRONT', value: frontVal, resultMessage: `FRONT = ${frontVal}`, statusType: 'amber' }
    });
    return frontVal;
  }

  // IsEmpty Operation (1 step)
  isEmpty() {
    const isEmp = this.front === -1 || this.front > this.rear;
    this.recordStep({
      opName: 'ISEMPTY',
      codeLine: this.cppLines.ISEMPTY_CHECK,
      description: `Checked if FRONT == -1. Result: ${isEmp ? 'TRUE (Queue is Empty)' : 'FALSE (Queue is Not Empty)'}.`,
      operationDetail: { action: 'IsEmpty Check', value: isEmp ? 'TRUE' : 'FALSE', resultMessage: isEmp ? 'Empty' : 'Not Empty', statusType: isEmp ? 'amber' : 'success' }
    });
    return isEmp;
  }

  // IsFull Operation (1 step)
  isFull() {
    const isFl = this.rear === this.capacity - 1;
    this.recordStep({
      opName: 'ISFULL',
      codeLine: this.cppLines.ISFULL_CHECK,
      description: `Checked if REAR == ${this.capacity - 1}. Result: ${isFl ? 'TRUE (Queue is Full)' : 'FALSE (Queue is Not Full)'}.`,
      operationDetail: { action: 'IsFull Check', value: isFl ? 'TRUE' : 'FALSE', resultMessage: isFl ? 'Queue Full' : 'Not Full', statusType: isFl ? 'danger' : 'success' }
    });
    return isFl;
  }

  // Clear Operation
  clear() {
    this.array = new Array(this.capacity).fill(null);
    this.front = -1;
    this.rear = -1;

    this.recordStep({
      opName: 'CLEAR',
      codeLine: this.cppLines.CLEAR_RESET,
      description: 'Queue cleared successfully. FRONT and REAR reset to -1.',
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
