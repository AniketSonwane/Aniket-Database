/**
 * Stack ADT Simulation Engine with C++ Debugger State Machine
 * Developed by Aniket | CS25131
 */

class StackEngine {
  constructor(initialCapacity = 5) {
    this.capacity = initialCapacity; // MAX
    this.stack = []; // array of elements arr[0..top]
    this.top = -1; // stack pointer index
    
    this.history = [];
    this.stats = {
      pushCount: 0,
      popCount: 0,
      peekCount: 0
    };

    this.steps = [];
    this.currentStepIndex = 0;

    // Initialize with default sample elements: 10, 20, 30
    this.initDefaultState();
  }

  initDefaultState() {
    this.stack = [10, 20, 30];
    this.top = 2;
    this.history = [
      { op: 'PUSH', val: 10, time: 'Init', status: 'success' },
      { op: 'PUSH', val: 20, time: 'Init', status: 'success' },
      { op: 'PUSH', val: 30, time: 'Init', status: 'success' }
    ];
    this.stats = { pushCount: 3, popCount: 0, peekCount: 0 };
    this.steps = [];

    // Initial step snapshot
    this.recordStep({
      operation: 'INIT',
      val: null,
      cLine: 15,
      cCodeSnippet: 'top = -1;',
      action: 'Stack initialized. arr[MAX = ' + this.capacity + '], top = ' + this.top,
      nextOp: 'Ready for user operations (PUSH, POP, PEEK, etc.)',
      conditionResult: null,
      resultValue: null,
      animationState: 'none',
      activeElementIndex: this.top,
      flowchartActiveNode: 'fc-start',
      status: 'info',
      statusMessage: 'Stack ADT initialized with capacity MAX = ' + this.capacity
    });

    this.currentStepIndex = 0;
  }

  setCapacity(newMax) {
    newMax = Math.max(1, Math.min(12, Number(newMax) || 5));
    this.capacity = newMax;
    // Trim stack if top >= capacity
    if (this.top >= this.capacity) {
      this.top = this.capacity - 1;
      this.stack = this.stack.slice(0, this.capacity);
    }
    
    this.recordStep({
      operation: 'RESIZE',
      val: this.capacity,
      cLine: 4,
      cCodeSnippet: '#define MAX ' + this.capacity,
      action: 'Stack capacity updated to MAX = ' + this.capacity,
      nextOp: 'Ready for operations',
      conditionResult: null,
      resultValue: null,
      animationState: 'none',
      activeElementIndex: this.top,
      flowchartActiveNode: 'fc-start',
      status: 'info',
      statusMessage: 'Set MAX = ' + this.capacity
    });
    this.currentStepIndex = this.steps.length - 1;
  }

  resetStack() {
    this.stack = [];
    this.top = -1;
    this.history = [];
    this.stats = { pushCount: 0, popCount: 0, peekCount: 0 };
    this.steps = [];

    this.recordStep({
      operation: 'RESET',
      val: null,
      cLine: 15,
      cCodeSnippet: 'top = -1;',
      action: 'Stack reset to empty state. top = -1',
      nextOp: 'Ready for PUSH or operations',
      conditionResult: null,
      resultValue: null,
      animationState: 'none',
      activeElementIndex: -1,
      flowchartActiveNode: 'fc-start',
      status: 'info',
      statusMessage: 'Stack cleared (top = -1)'
    });
    this.currentStepIndex = 0;
  }

  recordStep(details) {
    const snapshot = {
      stepId: this.steps.length,
      operation: details.operation || 'OP',
      val: details.val !== undefined ? details.val : null,
      cLine: details.cLine || 1,
      cCodeSnippet: details.cCodeSnippet || '',
      stack: [...this.stack],
      top: this.top,
      MAX: this.capacity,
      action: details.action || '',
      nextOp: details.nextOp || '',
      conditionResult: details.conditionResult || null,
      resultValue: details.resultValue !== undefined ? details.resultValue : null,
      animationState: details.animationState || 'none',
      activeElementIndex: details.activeElementIndex !== undefined ? details.activeElementIndex : this.top,
      flowchartActiveNode: details.flowchartActiveNode || 'fc-start',
      status: details.status || 'info',
      statusMessage: details.statusMessage || '',
      stats: { ...this.stats },
      history: JSON.parse(JSON.stringify(this.history))
    };
    this.steps.push(snapshot);
  }

  // PUSH Operation
  push(val) {
    val = Number(val);
    if (isNaN(val)) val = Math.floor(Math.random() * 90) + 10;

    // Sub-step 1: Function Call (Line 28)
    this.recordStep({
      operation: 'PUSH',
      val: val,
      cLine: 28,
      cCodeSnippet: 'void push(int value)',
      action: `Calling push(${val})`,
      nextOp: 'Check if stack is full using isFull()',
      conditionResult: null,
      flowchartActiveNode: 'fc-push-start',
      status: 'info',
      statusMessage: `Executing PUSH ${val}`
    });

    // Sub-step 2: Check isFull() (Line 30 & Line 25)
    const fullCheck = (this.top === this.capacity - 1);
    this.recordStep({
      operation: 'PUSH',
      val: val,
      cLine: 30,
      cCodeSnippet: 'if (isFull())',
      action: `Evaluate isFull(): top (${this.top}) == MAX - 1 (${this.capacity - 1}) -> ${fullCheck ? 'TRUE' : 'FALSE'}`,
      nextOp: fullCheck ? 'Report Stack Overflow' : 'Increment top pointer',
      conditionResult: fullCheck ? 'TRUE' : 'FALSE',
      flowchartActiveNode: 'fc-push-isfull',
      status: fullCheck ? 'warning' : 'info',
      statusMessage: fullCheck ? 'Stack is Full!' : 'Space available in stack'
    });

    if (fullCheck) {
      // Overflow branch (Line 32-33)
      this.recordStep({
        operation: 'PUSH',
        val: val,
        cLine: 32,
        cCodeSnippet: 'cout << "Stack Overflow";',
        action: '⚠ STACK OVERFLOW! Stack capacity MAX = ' + this.capacity + ' reached.',
        nextOp: 'return;',
        conditionResult: 'TRUE',
        animationState: 'overflow',
        flowchartActiveNode: 'fc-push-overflow',
        status: 'error',
        statusMessage: `⚠ STACK OVERFLOW: Cannot push ${val}. Stack is full.`
      });

      this.history.unshift({ op: 'PUSH ' + val, val, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), status: 'overflow' });

      this.recordStep({
        operation: 'PUSH',
        val: val,
        cLine: 33,
        cCodeSnippet: 'return;',
        action: 'Function returned due to Stack Overflow. Stack remains unchanged.',
        nextOp: 'Ready for next operation',
        conditionResult: 'TRUE',
        animationState: 'overflow',
        flowchartActiveNode: 'fc-push-overflow',
        status: 'error',
        statusMessage: `PUSH ${val} aborted due to Overflow`
      });

    } else {
      // Normal push execution
      const oldTop = this.top;
      this.top++;
      const newTop = this.top;

      // Sub-step 3: Increment top (Line 36 part 1)
      this.recordStep({
        operation: 'PUSH',
        val: val,
        cLine: 36,
        cCodeSnippet: 'arr[++top] = value; (Increment top)',
        action: `Incrementing top pointer: ${oldTop} → ${newTop}`,
        nextOp: `Assign arr[${newTop}] = ${val}`,
        conditionResult: 'FALSE',
        activeElementIndex: newTop,
        animationState: 'none',
        flowchartActiveNode: 'fc-push-inctop',
        status: 'info',
        statusMessage: `top pointer updated: ${newTop}`
      });

      // Sub-step 4: Store element at arr[top] (Line 36 part 2)
      this.stack[newTop] = val;
      this.stats.pushCount++;
      this.history.unshift({ op: 'PUSH ' + val, val, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), status: 'success' });

      this.recordStep({
        operation: 'PUSH',
        val: val,
        cLine: 36,
        cCodeSnippet: `arr[${newTop}] = ${val};`,
        action: `Stored ${val} at arr[${newTop}]`,
        nextOp: 'PUSH function completed',
        conditionResult: 'FALSE',
        activeElementIndex: newTop,
        animationState: 'entering',
        flowchartActiveNode: 'fc-push-store',
        status: 'success',
        statusMessage: `✓ PUSH Successful: Stored ${val} at index ${newTop}`
      });

      // Sub-step 5: Function completion (Line 37)
      this.recordStep({
        operation: 'PUSH',
        val: val,
        cLine: 37,
        cCodeSnippet: '}',
        action: `PUSH ${val} finished. Current size: ${this.top + 1} / ${this.capacity}`,
        nextOp: 'Ready for next operation',
        conditionResult: null,
        activeElementIndex: newTop,
        animationState: 'none',
        flowchartActiveNode: 'fc-end',
        status: 'success',
        statusMessage: `PUSH ${val} completed.`
      });
    }

    this.currentStepIndex = this.steps.length - 1;
  }

  // POP Operation
  pop() {
    // Sub-step 1: Function Call (Line 39)
    this.recordStep({
      operation: 'POP',
      val: null,
      cLine: 39,
      cCodeSnippet: 'void pop()',
      action: 'Calling pop()',
      nextOp: 'Check if stack is empty using isEmpty()',
      conditionResult: null,
      flowchartActiveNode: 'fc-pop-start',
      status: 'info',
      statusMessage: 'Executing POP'
    });

    // Sub-step 2: Check isEmpty() (Line 41 & Line 20)
    const emptyCheck = (this.top === -1);
    this.recordStep({
      operation: 'POP',
      val: null,
      cLine: 41,
      cCodeSnippet: 'if (isEmpty())',
      action: `Evaluate isEmpty(): top (${this.top}) == -1 -> ${emptyCheck ? 'TRUE' : 'FALSE'}`,
      nextOp: emptyCheck ? 'Report Stack Underflow' : 'Remove top element & decrement top',
      conditionResult: emptyCheck ? 'TRUE' : 'FALSE',
      flowchartActiveNode: 'fc-pop-isempty',
      status: emptyCheck ? 'warning' : 'info',
      statusMessage: emptyCheck ? 'Stack is Empty!' : 'Elements available in stack'
    });

    if (emptyCheck) {
      // Underflow branch (Line 43-44)
      this.recordStep({
        operation: 'POP',
        val: null,
        cLine: 43,
        cCodeSnippet: 'cout << "Stack Underflow";',
        action: '⚠ STACK UNDERFLOW! Cannot pop from empty stack (top = -1).',
        nextOp: 'return;',
        conditionResult: 'TRUE',
        animationState: 'underflow',
        flowchartActiveNode: 'fc-pop-underflow',
        status: 'error',
        statusMessage: '⚠ STACK UNDERFLOW: Cannot pop from an empty stack.'
      });

      this.history.unshift({ op: 'POP', val: null, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), status: 'underflow' });

      this.recordStep({
        operation: 'POP',
        val: null,
        cLine: 44,
        cCodeSnippet: 'return;',
        action: 'Function returned due to Stack Underflow. Stack remains empty.',
        nextOp: 'Ready for next operation',
        conditionResult: 'TRUE',
        animationState: 'underflow',
        flowchartActiveNode: 'fc-pop-underflow',
        status: 'error',
        statusMessage: 'POP aborted due to Underflow'
      });

    } else {
      // Normal pop execution
      const poppedVal = this.stack[this.top];
      const oldTop = this.top;

      // Sub-step 3: Animate element leaving (Line 47 part 1)
      this.recordStep({
        operation: 'POP',
        val: poppedVal,
        cLine: 47,
        cCodeSnippet: `Removing element arr[${oldTop}] = ${poppedVal}`,
        action: `Removing top element ${poppedVal} from logical stack (index ${oldTop})`,
        nextOp: 'Decrement top pointer',
        conditionResult: 'FALSE',
        activeElementIndex: oldTop,
        animationState: 'leaving',
        flowchartActiveNode: 'fc-pop-dectop',
        status: 'info',
        statusMessage: `Removing top element: ${poppedVal}`
      });

      // Sub-step 4: Decrement top (Line 47 part 2)
      this.top--;
      this.stack.pop();
      const newTop = this.top;
      this.stats.popCount++;
      this.history.unshift({ op: 'POP (' + poppedVal + ')', val: poppedVal, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), status: 'success' });

      this.recordStep({
        operation: 'POP',
        val: poppedVal,
        cLine: 47,
        cCodeSnippet: 'top--;',
        action: `Decremented top pointer: ${oldTop} → ${newTop}. ${poppedVal} removed.`,
        nextOp: 'POP function completed',
        conditionResult: 'FALSE',
        activeElementIndex: newTop,
        animationState: 'none',
        flowchartActiveNode: 'fc-pop-dectop',
        status: 'success',
        statusMessage: `✓ POP Successful: Removed ${poppedVal}. New top = ${newTop}`
      });

      // Sub-step 5: Completion (Line 48)
      this.recordStep({
        operation: 'POP',
        val: poppedVal,
        cLine: 48,
        cCodeSnippet: '}',
        action: `POP operation complete. Removed: ${poppedVal}`,
        nextOp: 'Ready for next operation',
        conditionResult: null,
        activeElementIndex: newTop,
        animationState: 'none',
        flowchartActiveNode: 'fc-end',
        status: 'success',
        statusMessage: `POP completed.`
      });
    }

    this.currentStepIndex = this.steps.length - 1;
  }

  // PEEK Operation
  peek() {
    // Sub-step 1: Function Call (Line 50)
    this.recordStep({
      operation: 'PEEK',
      val: null,
      cLine: 50,
      cCodeSnippet: 'int peek()',
      action: 'Calling peek()',
      nextOp: 'Check if stack is empty using isEmpty()',
      conditionResult: null,
      flowchartActiveNode: 'fc-peek-start',
      status: 'info',
      statusMessage: 'Executing PEEK'
    });

    const emptyCheck = (this.top === -1);
    this.recordStep({
      operation: 'PEEK',
      val: null,
      cLine: 52,
      cCodeSnippet: 'if (isEmpty())',
      action: `Evaluate isEmpty(): top (${this.top}) == -1 -> ${emptyCheck ? 'TRUE' : 'FALSE'}`,
      nextOp: emptyCheck ? 'Return -1 (Empty error)' : 'Return arr[top]',
      conditionResult: emptyCheck ? 'TRUE' : 'FALSE',
      flowchartActiveNode: 'fc-peek-isempty',
      status: emptyCheck ? 'warning' : 'info',
      statusMessage: emptyCheck ? 'Stack is Empty!' : 'Top element available'
    });

    if (emptyCheck) {
      this.recordStep({
        operation: 'PEEK',
        val: -1,
        cLine: 54,
        cCodeSnippet: 'return -1;',
        action: 'peek() returned -1 because stack is empty.',
        nextOp: 'Ready for next operation',
        conditionResult: 'TRUE',
        resultValue: -1,
        animationState: 'underflow',
        flowchartActiveNode: 'fc-peek-error',
        status: 'warning',
        statusMessage: 'PEEK returned -1 (Stack Empty)'
      });

      this.history.unshift({ op: 'PEEK', val: -1, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), status: 'warning' });

    } else {
      const topVal = this.stack[this.top];
      this.stats.peekCount++;
      this.history.unshift({ op: 'PEEK', val: topVal, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), status: 'success' });

      // Sub-step 2: Return arr[top] (Line 57)
      this.recordStep({
        operation: 'PEEK',
        val: topVal,
        cLine: 57,
        cCodeSnippet: `return arr[top]; (${topVal})`,
        action: `PEEK returns top element: arr[${this.top}] = ${topVal}. Stack remains unchanged!`,
        nextOp: 'PEEK completed',
        conditionResult: 'FALSE',
        resultValue: topVal,
        activeElementIndex: this.top,
        animationState: 'peek_highlight',
        flowchartActiveNode: 'fc-peek-return',
        status: 'success',
        statusMessage: `✓ PEEK: Top element is ${topVal}`
      });

      // Sub-step 3: Completion (Line 58)
      this.recordStep({
        operation: 'PEEK',
        val: topVal,
        cLine: 58,
        cCodeSnippet: '}',
        action: `PEEK finished. Result: ${topVal}`,
        nextOp: 'Ready for next operation',
        conditionResult: null,
        resultValue: topVal,
        activeElementIndex: this.top,
        animationState: 'none',
        flowchartActiveNode: 'fc-end',
        status: 'success',
        statusMessage: `PEEK completed. Stack size: ${this.top + 1}`
      });
    }

    this.currentStepIndex = this.steps.length - 1;
  }

  // isEmpty Check
  checkIsEmpty() {
    const isEmp = (this.top === -1);
    this.recordStep({
      operation: 'ISEMPTY',
      val: isEmp,
      cLine: 18,
      cCodeSnippet: 'bool isEmpty()',
      action: 'Calling isEmpty()',
      nextOp: 'Evaluate top == -1',
      conditionResult: null,
      flowchartActiveNode: 'fc-pop-isempty',
      status: 'info',
      statusMessage: 'Checking isEmpty()'
    });

    this.recordStep({
      operation: 'ISEMPTY',
      val: isEmp,
      cLine: 20,
      cCodeSnippet: `return top == -1; (${this.top} == -1 → ${isEmp ? 'true' : 'false'})`,
      action: `isEmpty() returned ${isEmp ? 'TRUE (Stack is empty)' : 'FALSE (Stack has elements)'}`,
      nextOp: 'Ready for next operation',
      conditionResult: isEmp ? 'TRUE' : 'FALSE',
      resultValue: isEmp,
      flowchartActiveNode: 'fc-pop-isempty',
      status: 'info',
      statusMessage: `isEmpty() → ${isEmp ? 'TRUE' : 'FALSE'}`
    });

    this.currentStepIndex = this.steps.length - 1;
  }

  // isFull Check
  checkIsFull() {
    const isF = (this.top === this.capacity - 1);
    this.recordStep({
      operation: 'ISFULL',
      val: isF,
      cLine: 23,
      cCodeSnippet: 'bool isFull()',
      action: 'Calling isFull()',
      nextOp: 'Evaluate top == MAX - 1',
      conditionResult: null,
      flowchartActiveNode: 'fc-push-isfull',
      status: 'info',
      statusMessage: 'Checking isFull()'
    });

    this.recordStep({
      operation: 'ISFULL',
      val: isF,
      cLine: 25,
      cCodeSnippet: `return top == MAX - 1; (${this.top} == ${this.capacity - 1} → ${isF ? 'true' : 'false'})`,
      action: `isFull() returned ${isF ? 'TRUE (Stack is full)' : 'FALSE (Stack has space)'}`,
      nextOp: 'Ready for next operation',
      conditionResult: isF ? 'TRUE' : 'FALSE',
      resultValue: isF,
      flowchartActiveNode: 'fc-push-isfull',
      status: 'info',
      statusMessage: `isFull() → ${isF ? 'TRUE' : 'FALSE'}`
    });

    this.currentStepIndex = this.steps.length - 1;
  }

  // Navigation Methods
  getCurrentStep() {
    if (this.steps.length === 0) return null;
    return this.steps[this.currentStepIndex];
  }

  nextStep() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
    }
    return this.getCurrentStep();
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
    return this.getCurrentStep();
  }

  goToStep(index) {
    if (index >= 0 && index < this.steps.length) {
      this.currentStepIndex = index;
    }
    return this.getCurrentStep();
  }
}
