/**
 * Circular Queue ADT (Array Implementation) Engine & State Machine
 * Capacity = 5, Modulo Arithmetic (% 5), FRONT/REAR Pointers,
 * Atomic Snapshot Step Recording for Stepper & Timeline Scrubbing.
 */

class CircularQueueEngine {
  constructor(capacity = 5) {
    this.capacity = capacity;
    this.array = new Array(capacity).fill(null);
    this.front = -1;
    this.rear = -1;

    this.historySteps = [];
    this.currentStepIndex = 0;

    this.totalEnqueues = 0;
    this.totalDequeues = 0;

    // C++ Line Mappings matching exact 58-line user code
    this.cppLines = {
      CONSTRUCTOR: 10,              // front = -1; rear = -1;
      ENQUEUE_START: 14,
      ENQUEUE_CHECK_FULL: 15,       // if ((rear + 1) % 5 == front)
      ENQUEUE_FULL_MSG: 16,         // cout << "Queue is Full\n";
      ENQUEUE_CHECK_FIRST: 20,     // if (front == -1) front = 0;
      ENQUEUE_CALC_REAR: 23,       // rear = (rear + 1) % 5;
      ENQUEUE_INSERT_VAL: 24,      // arr[rear] = value;

      DEQUEUE_START: 27,
      DEQUEUE_CHECK_EMPTY: 28,     // if (front == -1)
      DEQUEUE_EMPTY_MSG: 29,       // cout << "Queue is Empty\n";
      DEQUEUE_PRINT_VAL: 33,       // cout << "Deleted: " << arr[front] << endl;
      DEQUEUE_CHECK_SINGLE: 35,    // if (front == rear)
      DEQUEUE_RESET_BOTH: 36,      // front = rear = -1;
      DEQUEUE_CALC_FRONT: 38,      // front = (front + 1) % 5;

      DISPLAY_START: 42,
      DISPLAY_CHECK_EMPTY: 43,     // if (front == -1) return;
      DISPLAY_INIT_I: 48,          // int i = front;
      DISPLAY_PRINT_ELEM: 51,      // cout << arr[i] << " ";
      DISPLAY_CHECK_REAR: 52,      // if (i == rear) break;
      DISPLAY_CALC_I: 54           // i = (i + 1) % 5;
    };

    this.reset();
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
      opName: 'INITIALIZE',
      codeLine: this.cppLines.CONSTRUCTOR,
      variableDelta: 'front = -1, rear = -1',
      description: 'Circular Queue initialized. Capacity = 5. FRONT = -1, REAR = -1 (Queue is Empty).',
      operationDetail: { action: 'Initialize', value: 'None', resultMessage: 'Queue Empty', statusType: 'amber' },
      microSteps: [
        { text: '1. Create array of size 5: arr[5]', active: false },
        { text: '2. Set front = -1, rear = -1', active: true },
        { text: '3. Status: Empty (0 / 5 slots used)', active: false }
      ]
    });
  }

  isQueueFull() {
    if (this.front === -1) return false;
    return ((this.rear + 1) % this.capacity) === this.front;
  }

  isQueueEmpty() {
    return this.front === -1;
  }

  getOccupiedCount() {
    if (this.front === -1 || this.rear === -1) return 0;
    if (this.rear >= this.front) {
      return this.rear - this.front + 1;
    } else {
      return (this.capacity - this.front) + (this.rear + 1);
    }
  }

  getActiveElementsInOrder() {
    if (this.front === -1 || this.rear === -1) return [];
    const result = [];
    let i = this.front;
    let count = 0;
    while (count < this.capacity) {
      if (this.array[i] !== null && this.array[i] !== undefined) {
        result.push({ index: i, value: this.array[i] });
      }
      if (i === this.rear) break;
      i = (i + 1) % this.capacity;
      count++;
    }
    return result;
  }

  getCurrentSnapshot() {
    const occupied = this.getOccupiedCount();
    const frontVal = (this.front !== -1) ? this.array[this.front] : 'NULL';
    const rearVal = (this.rear !== -1) ? this.array[this.rear] : 'NULL';
    const isFull = this.isQueueFull();
    const isEmpty = this.isQueueEmpty();
    const isWrapped = (this.front !== -1 && this.rear !== -1 && this.rear < this.front);

    return {
      array: [...this.array],
      front: this.front,
      rear: this.rear,
      capacity: this.capacity,
      size: occupied,
      emptyCount: this.capacity - occupied,
      frontVal: frontVal,
      rearVal: rearVal,
      isFull: isFull,
      isEmpty: isEmpty,
      isWrapped: isWrapped,
      totalEnqueues: this.totalEnqueues,
      totalDequeues: this.totalDequeues,
      activeElements: this.getActiveElementsInOrder()
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
      dequeueIndex: config.dequeueIndex !== undefined ? config.dequeueIndex : null,
      peekIndex: config.peekIndex !== undefined ? config.peekIndex : null,
      codeLine: config.codeLine || 1,
      variableDelta: config.variableDelta || '',
      description: config.description || '',
      isWrapStep: !!config.isWrapStep,
      isFullAlert: !!config.isFullAlert,
      isEmptyAlert: !!config.isEmptyAlert,
      microSteps: config.microSteps || [],
      stats: {
        capacity: snap.capacity,
        size: config.customSize !== undefined ? config.customSize : snap.size,
        emptyCount: config.customSize !== undefined ? (snap.capacity - config.customSize) : snap.emptyCount,
        frontIndex: config.customFront !== undefined ? config.customFront : snap.front,
        rearIndex: config.customRear !== undefined ? config.customRear : snap.rear,
        frontVal: config.customFrontVal !== undefined ? config.customFrontVal : snap.frontVal,
        rearVal: config.customRearVal !== undefined ? config.customRearVal : snap.rearVal,
        isFull: config.customIsFull !== undefined ? config.customIsFull : snap.isFull,
        isEmpty: config.customIsEmpty !== undefined ? config.customIsEmpty : snap.isEmpty,
        isWrapped: config.customIsWrapped !== undefined ? config.customIsWrapped : snap.isWrapped,
        totalEnqueues: this.totalEnqueues,
        totalDequeues: this.totalDequeues,
        activeElements: config.customActiveElements || snap.activeElements
      },
      operationDetail: config.operationDetail || {
        action: 'Operation',
        value: 'None',
        resultMessage: 'Completed',
        statusType: 'success'
      }
    };

    this.historySteps.push(step);
    return step;
  }

  /**
   * Enqueue Operation with atomic micro-steps
   */
  enqueue(value) {
    const prevFront = this.front;
    const prevRear = this.rear;
    const nextRearCalc = (prevRear + 1) % this.capacity;

    // Micro-Step 1: Check if Full: ((rear + 1) % 5 == front)
    const isFullCheck = (prevFront !== -1 && nextRearCalc === prevFront);
    
    this.recordStep({
      opName: 'ENQUEUE: CHECK FULL',
      codeLine: this.cppLines.ENQUEUE_CHECK_FULL,
      variableDelta: `(rear + 1) % 5 = (${prevRear} + 1) % 5 = ${nextRearCalc} ${isFullCheck ? '==' : '!='} front(${prevFront})`,
      description: `Checking if Queue is Full: (rear + 1) % 5 == front. (${prevRear} + 1) % 5 = ${nextRearCalc}, front = ${prevFront}. Result: ${isFullCheck ? 'TRUE (Queue Full!)' : 'FALSE (Space available)'}.`,
      isFullAlert: isFullCheck,
      operationDetail: {
        action: 'Enqueue',
        value: value,
        resultMessage: isFullCheck ? 'Queue is Full!' : 'Space Available',
        statusType: isFullCheck ? 'danger' : 'amber'
      },
      microSteps: [
        { text: `1. Check Full: (${prevRear} + 1) % 5 == ${prevFront} ? ${isFullCheck ? 'YES' : 'NO'}`, active: true },
        { text: `2. Update front if -1`, active: false },
        { text: `3. Calculate rear = (${prevRear} + 1) % 5`, active: false },
        { text: `4. Insert arr[rear] = ${value}`, active: false }
      ]
    });

    if (isFullCheck) {
      this.recordStep({
        opName: 'ENQUEUE: OVERFLOW',
        codeLine: this.cppLines.ENQUEUE_FULL_MSG,
        variableDelta: 'Queue Overflow: Operation Rejected',
        description: `Cannot enqueue ${value}! The Circular Queue is completely full. Next position ${nextRearCalc} collides with FRONT (${prevFront}).`,
        isFullAlert: true,
        operationDetail: {
          action: 'Enqueue',
          value: value,
          resultMessage: 'Rejected: Queue Full',
          statusType: 'danger'
        },
        microSteps: [
          { text: `1. Full check passed: Queue is Full!`, active: false },
          { text: `2. Output: "Queue is Full"`, active: true },
          { text: `3. Return without insertion`, active: false }
        ]
      });
      return false;
    }

    // Micro-Step 2: If front == -1, set front = 0
    let currentFront = prevFront;
    if (currentFront === -1) {
      currentFront = 0;
      this.front = 0;
      this.recordStep({
        opName: 'ENQUEUE: INIT FRONT',
        codeLine: this.cppLines.ENQUEUE_CHECK_FIRST,
        customFront: 0,
        variableDelta: 'front = 0',
        description: `First element being inserted! Since front == -1, set front = 0.`,
        operationDetail: {
          action: 'Enqueue',
          value: value,
          resultMessage: 'Initialized FRONT = 0',
          statusType: 'amber'
        },
        microSteps: [
          { text: `1. Check Full: FALSE`, active: false },
          { text: `2. front was -1 -> set front = 0`, active: true },
          { text: `3. Calculate rear = (${prevRear} + 1) % 5`, active: false },
          { text: `4. Insert arr[rear] = ${value}`, active: false }
        ]
      });
    }

    // Micro-Step 3: Advance rear = (rear + 1) % 5
    const wasWrapped = (prevRear === this.capacity - 1 && nextRearCalc === 0);
    this.rear = nextRearCalc;

    this.recordStep({
      opName: wasWrapped ? 'ENQUEUE: WRAP AROUND!' : 'ENQUEUE: ADVANCE REAR',
      codeLine: this.cppLines.ENQUEUE_CALC_REAR,
      customRear: this.rear,
      variableDelta: `rear: ${prevRear} → ${this.rear}`,
      isWrapStep: wasWrapped,
      description: wasWrapped
        ? `🔄 CIRCULAR WRAP-AROUND! rear was at index 4 (end). (4 + 1) % 5 = 0. REAR successfully wraps around to index 0!`
        : `Calculated next rear position: rear = (${prevRear} + 1) % 5 = ${this.rear}.`,
      operationDetail: {
        action: 'Enqueue',
        value: value,
        resultMessage: wasWrapped ? 'Wrapped to Index 0' : `REAR = ${this.rear}`,
        statusType: wasWrapped ? 'purple' : 'amber'
      },
      microSteps: [
        { text: `1. Check Full: Space available`, active: false },
        { text: `2. FRONT confirmed at ${this.front}`, active: false },
        { text: `3. rear = (${prevRear} + 1) % 5 = ${this.rear} ${wasWrapped ? '(WRAP!)' : ''}`, active: true },
        { text: `4. Insert arr[${this.rear}] = ${value}`, active: false }
      ]
    });

    // Micro-Step 4: Store arr[rear] = value
    this.array[this.rear] = value;
    this.totalEnqueues++;

    this.recordStep({
      opName: 'ENQUEUE: SUCCESS',
      codeLine: this.cppLines.ENQUEUE_INSERT_VAL,
      highlightIndex: this.rear,
      variableDelta: `arr[${this.rear}] = ${value}`,
      description: `Successfully enqueued ${value} into arr[${this.rear}]. Queue now holds ${this.getOccupiedCount()} element(s).`,
      operationDetail: {
        action: 'Enqueue',
        value: value,
        resultMessage: `Enqueued ${value} at [${this.rear}]`,
        statusType: 'success'
      },
      microSteps: [
        { text: `1. Check Full: OK`, active: false },
        { text: `2. FRONT: ${this.front}`, active: false },
        { text: `3. REAR: ${this.rear}`, active: false },
        { text: `4. arr[${this.rear}] = ${value} (Stored)`, active: true }
      ]
    });

    return true;
  }

  /**
   * Dequeue Operation with atomic micro-steps
   */
  dequeue() {
    if (this.isQueueEmpty()) {
      this.recordStep({
        opName: 'DEQUEUE: UNDERFLOW',
        codeLine: this.cppLines.DEQUEUE_CHECK_EMPTY,
        variableDelta: 'front == -1 (Queue Empty)',
        isEmptyAlert: true,
        description: 'Cannot dequeue! The Circular Queue is empty (front == -1). Dequeue aborted.',
        operationDetail: {
          action: 'Dequeue',
          value: 'None',
          resultMessage: 'Queue Underflow',
          statusType: 'danger'
        },
        microSteps: [
          { text: '1. Check Empty: front == -1 ? YES', active: true },
          { text: '2. Print "Queue is Empty"', active: false },
          { text: '3. Return', active: false }
        ]
      });
      return null;
    }

    const prevFront = this.front;
    const prevRear = this.rear;
    const deletedVal = this.array[prevFront];

    // Micro-Step 1: Check empty -> false, prepare to delete
    this.recordStep({
      opName: 'DEQUEUE: READ ELEMENT',
      codeLine: this.cppLines.DEQUEUE_PRINT_VAL,
      dequeueIndex: prevFront,
      variableDelta: `Deleted: arr[${prevFront}] = ${deletedVal}`,
      description: `Reading element at FRONT (index ${prevFront}): ${deletedVal}. "Deleted: ${deletedVal}".`,
      operationDetail: {
        action: 'Dequeue',
        value: deletedVal,
        resultMessage: `Reading ${deletedVal}`,
        statusType: 'amber'
      },
      microSteps: [
        { text: '1. Check Empty: front != -1 (OK)', active: false },
        { text: `2. Read arr[${prevFront}] = ${deletedVal}`, active: true },
        { text: `3. Check if front == rear`, active: false },
        { text: `4. Advance front = (front + 1) % 5`, active: false }
      ]
    });

    // Clear the cell from storage
    this.array[prevFront] = null;
    this.totalDequeues++;

    // Micro-Step 2: Check if single element (front == rear)
    if (prevFront === prevRear) {
      this.front = -1;
      this.rear = -1;

      this.recordStep({
        opName: 'DEQUEUE: RESET (EMPTY)',
        codeLine: this.cppLines.DEQUEUE_RESET_BOTH,
        variableDelta: 'front = -1, rear = -1',
        description: `Single element was removed (front == rear == ${prevFront}). The queue is now completely empty. Reset front = rear = -1.`,
        operationDetail: {
          action: 'Dequeue',
          value: deletedVal,
          resultMessage: `Deleted ${deletedVal} (Queue Empty)`,
          statusType: 'success'
        },
        microSteps: [
          { text: `1. Removed value ${deletedVal}`, active: false },
          { text: `2. front == rear (${prevFront} == ${prevRear}) ? YES`, active: true },
          { text: `3. Reset front = -1, rear = -1`, active: true }
        ]
      });
    } else {
      const nextFrontCalc = (prevFront + 1) % this.capacity;
      const wasFrontWrapped = (prevFront === this.capacity - 1 && nextFrontCalc === 0);
      this.front = nextFrontCalc;

      this.recordStep({
        opName: wasFrontWrapped ? 'DEQUEUE: FRONT WRAP AROUND!' : 'DEQUEUE: ADVANCE FRONT',
        codeLine: this.cppLines.DEQUEUE_CALC_FRONT,
        variableDelta: `front: ${prevFront} → ${this.front}`,
        isWrapStep: wasFrontWrapped,
        description: wasFrontWrapped
          ? `🔄 FRONT WRAP-AROUND! front was at index 4. (4 + 1) % 5 = 0. FRONT successfully wraps around to index 0!`
          : `Advanced front pointer: front = (${prevFront} + 1) % 5 = ${this.front}.`,
        operationDetail: {
          action: 'Dequeue',
          value: deletedVal,
          resultMessage: `Deleted ${deletedVal}, FRONT = ${this.front}`,
          statusType: 'success'
        },
        microSteps: [
          { text: `1. Deleted value ${deletedVal} at index ${prevFront}`, active: false },
          { text: `2. front != rear (${prevFront} != ${prevRear})`, active: false },
          { text: `3. front = (${prevFront} + 1) % 5 = ${this.front} ${wasFrontWrapped ? '(WRAP!)' : ''}`, active: true }
        ]
      });
    }

    return deletedVal;
  }

  /**
   * Display Operation with step-by-step traversal
   */
  display() {
    if (this.isQueueEmpty()) {
      this.recordStep({
        opName: 'DISPLAY: EMPTY',
        codeLine: this.cppLines.DISPLAY_CHECK_EMPTY,
        variableDelta: 'Queue is Empty',
        isEmptyAlert: true,
        description: 'display() called: Queue is Empty (front == -1). Nothing to display.',
        operationDetail: { action: 'Display', value: 'None', resultMessage: 'Queue is Empty', statusType: 'amber' }
      });
      return [];
    }

    const elements = this.getActiveElementsInOrder();
    const orderStr = elements.map(e => e.value).join(' ');

    this.recordStep({
      opName: 'DISPLAY: TRAVERSAL',
      codeLine: this.cppLines.DISPLAY_PRINT_ELEM,
      variableDelta: `Order: ${orderStr}`,
      description: `display() traversing circularly from FRONT (${this.front}) to REAR (${this.rear}): [ ${orderStr} ].`,
      operationDetail: {
        action: 'Display',
        value: orderStr,
        resultMessage: `Elements: ${orderStr}`,
        statusType: 'success'
      },
      microSteps: [
        { text: `1. Start at i = front (${this.front})`, active: false },
        { text: `2. Loop printing arr[i] until i == rear (${this.rear})`, active: true },
        { text: `3. Advance i = (i + 1) % 5`, active: false }
      ]
    });

    return elements;
  }

  getStep(index) {
    if (index >= 0 && index < this.historySteps.length) {
      return this.historySteps[index];
    }
    return null;
  }

  getTotalSteps() {
    return this.historySteps.length;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CircularQueueEngine;
}
