/**
 * Stack ADT (Linked List) Engine & Step History Manager
 * Manages the underlying linked list stack structure and records discrete animation steps.
 */

class StackEngine {
  constructor() {
    this.stack = []; // Array of nodes representing linked list from TOP (index 0) to bottom
    this.nodeCounter = 0;
    this.historySteps = [];
    this.currentStepIndex = 0;
    
    // Global Stats
    this.totalPushes = 0;
    this.totalPops = 0;

    // C++ Snippets mapping line numbers for operations
    this.cppLines = {
      PUSH_ALLOC: 2,     // Node* newNode = new Node(); newNode->data = val;
      PUSH_CONNECT: 3,   // newNode->next = top;
      PUSH_UPDATE_TOP: 4,// top = newNode;
      
      POP_CHECK: 7,      // if (top == NULL) return;
      POP_TEMP: 8,       // Node* temp = top;
      POP_MOVE_TOP: 9,   // top = top->next;
      POP_DELETE: 10,    // delete temp;

      PEEK_CHECK: 13,    // if (top == NULL) return -1;
      PEEK_RETURN: 14,   // return top->data;

      ISEMPTY_CHECK: 17, // return top == NULL;

      CLEAR_LOOP: 20     // while (top != NULL) pop();
    };
  }

  reset() {
    this.stack = [];
    this.nodeCounter = 0;
    this.historySteps = [];
    this.currentStepIndex = 0;
    this.totalPushes = 0;
    this.totalPops = 0;
    
    // Initial empty state step
    this.recordStep({
      opName: 'INITIAL',
      description: 'Stack initialized as empty. TOP points to NULL.',
      codeLine: 1,
      operationDetail: { action: 'Initialize', value: 'NULL', resultMessage: 'Stack Empty', statusType: 'amber' }
    });
  }

  getCurrentStateSnapshot() {
    const topNode = this.stack.length > 0 ? this.stack[0] : null;
    return {
      nodes: this.stack.map((n, idx) => ({
        id: n.id,
        data: n.data,
        nextId: idx < this.stack.length - 1 ? this.stack[idx + 1].id : null,
        nextVal: idx < this.stack.length - 1 ? this.stack[idx + 1].data : 'NULL'
      })),
      size: this.stack.length,
      topVal: topNode ? topNode.data : 'NULL',
      topId: topNode ? topNode.id : null,
      isEmpty: this.stack.length === 0,
      totalPushes: this.totalPushes,
      totalPops: this.totalPops
    };
  }

  recordStep(config) {
    const snapshot = this.getCurrentStateSnapshot();
    const step = {
      stepIndex: this.historySteps.length + 1,
      opName: config.opName || 'STEP',
      nodes: config.customNodes || snapshot.nodes,
      topId: config.customTopId !== undefined ? config.customTopId : snapshot.topId,
      highlightNodeId: config.highlightNodeId || null,
      popNodeId: config.popNodeId || null,
      peekNodeId: config.peekNodeId || null,
      newNodeId: config.newNodeId || null,
      codeLine: config.codeLine || 1,
      description: config.description || '',
      stats: {
        size: config.customSize !== undefined ? config.customSize : snapshot.size,
        topVal: config.customTopVal !== undefined ? config.customTopVal : snapshot.topVal,
        isEmpty: config.customIsEmpty !== undefined ? config.customIsEmpty : snapshot.isEmpty,
        totalPushes: snapshot.totalPushes,
        totalPops: snapshot.totalPops
      },
      operationDetail: config.operationDetail || { action: 'Idle', value: '-', resultMessage: 'Ready', statusType: 'success' }
    };
    this.historySteps.push(step);
  }

  // Push Operation (3 sub-steps)
  push(value) {
    this.nodeCounter++;
    const newNode = {
      id: `node-${this.nodeCounter}`,
      data: value
    };
    this.totalPushes++;

    const currentTop = this.stack.length > 0 ? this.stack[0] : null;

    // Step 1: Allocate memory & set data
    const tempNodesStep1 = [
      { id: newNode.id, data: newNode.data, nextId: null, nextVal: 'Unconnected', isNew: true },
      ...this.getCurrentStateSnapshot().nodes
    ];

    this.recordStep({
      opName: 'PUSH',
      newNodeId: newNode.id,
      customNodes: tempNodesStep1,
      customTopId: currentTop ? currentTop.id : null, // TOP still points to old top
      codeLine: this.cppLines.PUSH_ALLOC,
      description: `Step 1: Created new node with value ${value}. Memory allocated.`,
      operationDetail: { action: 'Push: Allocate', value: value, resultMessage: `Allocated Node(${value})`, statusType: 'amber' }
    });

    // Step 2: Connect newNode->next = top
    const tempNodesStep2 = [
      { id: newNode.id, data: newNode.data, nextId: currentTop ? currentTop.id : null, nextVal: currentTop ? currentTop.data : 'NULL' },
      ...this.getCurrentStateSnapshot().nodes
    ];

    this.recordStep({
      opName: 'PUSH',
      newNodeId: newNode.id,
      customNodes: tempNodesStep2,
      customTopId: currentTop ? currentTop.id : null, // TOP still points to old top
      codeLine: this.cppLines.PUSH_CONNECT,
      description: `Step 2: Linked newNode->next to current TOP (${currentTop ? currentTop.data : 'NULL'}).`,
      operationDetail: { action: 'Push: Connect', value: value, resultMessage: `Linked -> ${currentTop ? currentTop.data : 'NULL'}`, statusType: 'amber' }
    });

    // Step 3: Update top = newNode
    this.stack.unshift(newNode);

    this.recordStep({
      opName: 'PUSH',
      newNodeId: newNode.id,
      highlightNodeId: newNode.id,
      codeLine: this.cppLines.PUSH_UPDATE_TOP,
      description: `Step 3: Updated TOP pointer to point to new node (${value}). Push complete.`,
      operationDetail: { action: 'Push: Success', value: value, resultMessage: `Pushed ${value}`, statusType: 'success' }
    });
  }

  // Pop Operation (3 sub-steps)
  pop() {
    if (this.stack.length === 0) {
      // Stack Underflow
      this.recordStep({
        opName: 'POP',
        codeLine: this.cppLines.POP_CHECK,
        description: 'Stack Underflow! Attempted Pop on an empty stack (top == NULL).',
        operationDetail: { action: 'Pop: Underflow', value: 'NONE', resultMessage: 'Stack Underflow!', statusType: 'danger' }
      });
      return false;
    }

    this.totalPops++;
    const poppedNode = this.stack[0];
    const nextTopNode = this.stack.length > 1 ? this.stack[1] : null;

    // Step 1: Identify TOP node with temp pointer
    this.recordStep({
      opName: 'POP',
      popNodeId: poppedNode.id,
      highlightNodeId: poppedNode.id,
      codeLine: this.cppLines.POP_TEMP,
      description: `Step 1: Stored current TOP node (${poppedNode.data}) in temporary pointer temp.`,
      operationDetail: { action: 'Pop: Target', value: poppedNode.data, resultMessage: `Targeting TOP (${poppedNode.data})`, statusType: 'amber' }
    });

    // Step 2: Move TOP pointer to top->next
    this.recordStep({
      opName: 'POP',
      popNodeId: poppedNode.id,
      customTopId: nextTopNode ? nextTopNode.id : null,
      customTopVal: nextTopNode ? nextTopNode.data : 'NULL',
      customSize: this.stack.length - 1,
      customIsEmpty: this.stack.length - 1 === 0,
      codeLine: this.cppLines.POP_MOVE_TOP,
      description: `Step 2: Moved TOP pointer to next node (${nextTopNode ? nextTopNode.data : 'NULL'}).`,
      operationDetail: { action: 'Pop: Move TOP', value: poppedNode.data, resultMessage: `TOP shifted -> ${nextTopNode ? nextTopNode.data : 'NULL'}`, statusType: 'amber' }
    });

    // Step 3: Delete temp node
    this.stack.shift();

    this.recordStep({
      opName: 'POP',
      codeLine: this.cppLines.POP_DELETE,
      description: `Step 3: Deallocated memory for node ${poppedNode.data}. Pop complete.`,
      operationDetail: { action: 'Pop: Success', value: poppedNode.data, resultMessage: `Popped ${poppedNode.data}`, statusType: 'danger' }
    });

    return true;
  }

  // Peek Operation (1 step)
  peek() {
    if (this.stack.length === 0) {
      this.recordStep({
        opName: 'PEEK',
        codeLine: this.cppLines.PEEK_CHECK,
        description: 'Stack is Empty! Peek returned NULL.',
        operationDetail: { action: 'Peek: Empty', value: 'NULL', resultMessage: 'Stack is Empty', statusType: 'amber' }
      });
      return null;
    }

    const topNode = this.stack[0];
    this.recordStep({
      opName: 'PEEK',
      peekNodeId: topNode.id,
      codeLine: this.cppLines.PEEK_RETURN,
      description: `Peeked at TOP element. Value is ${topNode.data}. Stack unchanged.`,
      operationDetail: { action: 'Peek: Top', value: topNode.data, resultMessage: `Top Value = ${topNode.data}`, statusType: 'amber' }
    });
    return topNode.data;
  }

  // IsEmpty Operation (1 step)
  isEmpty() {
    const isEmp = this.stack.length === 0;
    this.recordStep({
      opName: 'ISEMPTY',
      codeLine: this.cppLines.ISEMPTY_CHECK,
      description: `Checked if TOP == NULL. Result: ${isEmp ? 'TRUE (Stack is Empty)' : 'FALSE (Stack is Not Empty)'}.`,
      operationDetail: { action: 'IsEmpty Check', value: isEmp ? 'TRUE' : 'FALSE', resultMessage: isEmp ? 'Empty' : 'Not Empty', statusType: isEmp ? 'amber' : 'success' }
    });
    return isEmp;
  }

  // Clear Operation (Sequential clearing)
  clear() {
    if (this.stack.length === 0) {
      this.recordStep({
        opName: 'CLEAR',
        codeLine: this.cppLines.CLEAR_LOOP,
        description: 'Stack is already empty.',
        operationDetail: { action: 'Clear', value: '0 items', resultMessage: 'Already Empty', statusType: 'amber' }
      });
      return;
    }

    this.recordStep({
      opName: 'CLEAR',
      codeLine: this.cppLines.CLEAR_LOOP,
      description: `Initiating Clear operation on ${this.stack.length} elements...`,
      operationDetail: { action: 'Clear: Start', value: `${this.stack.length} nodes`, resultMessage: 'Clearing All', statusType: 'amber' }
    });

    while (this.stack.length > 0) {
      this.pop();
    }

    this.recordStep({
      opName: 'CLEAR',
      codeLine: this.cppLines.CLEAR_LOOP,
      description: 'Stack cleared successfully. All memory deallocated.',
      operationDetail: { action: 'Clear: Complete', value: '0 items', resultMessage: 'Stack Cleared', statusType: 'success' }
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
  module.exports = StackEngine;
}
