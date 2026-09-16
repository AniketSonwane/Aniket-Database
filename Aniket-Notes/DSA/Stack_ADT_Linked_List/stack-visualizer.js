/**
 * DOM Renderer & Visualizer for Stack ADT (Linked List)
 * Handles visual node stack generation, TOP pointer positioning, line highlighting, stats, and animations.
 */

class StackVisualizer {
  constructor() {
    this.stackStage = document.getElementById('stackStage');
    this.statSize = document.getElementById('statSize');
    this.statTop = document.getElementById('statTop');
    this.statStatus = document.getElementById('statStatus');
    this.statPushes = document.getElementById('statPushes');
    this.statPops = document.getElementById('statPops');

    this.opAction = document.getElementById('opAction');
    this.opValue = document.getElementById('opValue');
    this.opResult = document.getElementById('opResult');
    this.opInfoText = document.getElementById('opInfoText');

    this.stepCounterText = document.getElementById('stepCounterText');
    this.stepDescText = document.getElementById('stepDescText');

    this.lifoContainer = document.getElementById('lifoContainer');
    this.historyLogList = document.getElementById('historyLogList');

    this.codeLinesContainer = document.getElementById('cppCodeLines');
    this.timelineSlider = document.getElementById('timelineSlider');

    // C++ Source Code Snippet Definition with Line Numbers
    this.cppSnippet = [
      { line: 1, text: '// Stack Operations' },
      { line: 2, text: 'Node* newNode = new Node(); newNode->data = val;' },
      { line: 3, text: 'newNode->next = top;' },
      { line: 4, text: 'top = newNode;' },
      { line: 5, text: '' },
      { line: 6, text: '// Pop Operation' },
      { line: 7, text: 'if (top == nullptr) return;' },
      { line: 8, text: 'Node* temp = top;' },
      { line: 9, text: 'top = top->next;' },
      { line: 10, text: 'delete temp;' },
      { line: 11, text: '' },
      { line: 12, text: '// Peek Operation' },
      { line: 13, text: 'if (top == nullptr) return -1;' },
      { line: 14, text: 'return top->data;' },
      { line: 15, text: '' },
      { line: 16, text: '// IsEmpty Operation' },
      { line: 17, text: 'return top == nullptr;' },
      { line: 18, text: '' },
      { line: 19, text: '// Clear Operation' },
      { line: 20, text: 'while (top != nullptr) pop();' }
    ];

    this.renderCppCode();
  }

  renderCppCode() {
    if (!this.codeLinesContainer) return;
    this.codeLinesContainer.innerHTML = '';
    
    this.cppSnippet.forEach(item => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'code-line';
      lineDiv.id = `cpp-line-${item.line}`;
      
      const lineNumSpan = document.createElement('span');
      lineNumSpan.className = 'line-num';
      lineNumSpan.textContent = item.line;

      const lineCodeSpan = document.createElement('span');
      lineCodeSpan.className = 'line-code';
      lineCodeSpan.textContent = item.text;

      lineDiv.appendChild(lineNumSpan);
      lineDiv.appendChild(lineCodeSpan);
      this.codeLinesContainer.appendChild(lineDiv);
    });
  }

  highlightCodeLine(lineNum) {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active-highlight'));
    if (lineNum) {
      const activeEl = document.getElementById(`cpp-line-${lineNum}`);
      if (activeEl) {
        activeEl.classList.add('active-highlight');
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  renderStep(step, totalSteps) {
    if (!step) return;

    // 1. Update Timeline & Step Counter
    if (this.stepCounterText) {
      this.stepCounterText.textContent = `Step: ${step.stepIndex} / ${totalSteps}`;
    }
    if (this.timelineSlider) {
      this.timelineSlider.max = totalSteps;
      this.timelineSlider.value = step.stepIndex;
    }

    // 2. Update Description & C++ Line Highlight
    if (this.stepDescText) {
      this.stepDescText.textContent = step.description;
    }
    this.highlightCodeLine(step.codeLine);

    // 3. Update Statistics Panel
    if (this.statSize) this.statSize.textContent = step.stats.size;
    if (this.statTop) this.statTop.textContent = step.stats.topVal;
    if (this.statStatus) {
      this.statStatus.textContent = step.stats.isEmpty ? 'Empty' : 'Not Empty';
      this.statStatus.style.color = step.stats.isEmpty ? '#f59e0b' : '#10b981';
    }
    if (this.statPushes) this.statPushes.textContent = step.stats.totalPushes;
    if (this.statPops) this.statPops.textContent = step.stats.totalPops;

    // 4. Update Current Operation Panel
    if (this.opAction) this.opAction.textContent = step.operationDetail.action;
    if (this.opValue) this.opValue.textContent = step.operationDetail.value;
    if (this.opResult) {
      this.opResult.textContent = step.operationDetail.resultMessage;
      this.opResult.className = `op-val ${step.operationDetail.statusType}`;
    }
    if (this.opInfoText) this.opInfoText.textContent = step.description;

    // 5. Update LIFO Tracking Visualizer Bar
    this.renderLifoBar(step.nodes);

    // 6. Render Stack Stage Canvas
    this.renderStackCanvas(step);
  }

  renderLifoBar(nodes) {
    if (!this.lifoContainer) return;
    this.lifoContainer.innerHTML = '';
    
    if (!nodes || nodes.length === 0) {
      const emptySpan = document.createElement('span');
      emptySpan.className = 'text-sm text-dim italic';
      emptySpan.textContent = 'Stack is empty (No elements)';
      this.lifoContainer.appendChild(emptySpan);
      return;
    }

    nodes.forEach((node, index) => {
      const pill = document.createElement('div');
      pill.className = `lifo-pill ${index === 0 ? 'top-item' : ''}`;
      pill.textContent = index === 0 ? `[TOP: ${node.data}]` : `${node.data}`;
      this.lifoContainer.appendChild(pill);
    });
  }

  renderStackCanvas(step) {
    if (!this.stackStage) return;
    this.stackStage.innerHTML = '';

    const nodes = step.nodes;
    const topId = step.topId;

    // TOP Pointer Indicator Badge
    const topBadge = document.createElement('div');
    topBadge.className = `top-pointer-badge ${nodes.length === 0 ? 'empty' : ''}`;
    topBadge.innerHTML = `
      <span>TOP Pointer</span>
      <span class="top-arrow-down">↓</span>
      <span>${step.stats.topVal === 'NULL' ? 'NULL' : step.stats.topVal}</span>
    `;
    this.stackStage.appendChild(topBadge);

    // If Stack is Empty
    if (!nodes || nodes.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'empty-stack-placeholder';
      emptyBox.innerHTML = `
        <div class="empty-icon">📂</div>
        <p class="font-bold text-slate-300">Stack is Currently Empty</p>
        <p class="text-xs text-dim">Use Push to add elements onto the stack.</p>
      `;
      this.stackStage.appendChild(emptyBox);

      // NULL Badge
      const nullBadge = document.createElement('div');
      nullBadge.className = 'null-node-badge';
      nullBadge.textContent = 'NULL Pointer (Ground)';
      this.stackStage.appendChild(nullBadge);
      return;
    }

    // Node Stack List Wrapper
    const stackList = document.createElement('div');
    stackList.className = 'node-stack-list';

    nodes.forEach((node, index) => {
      const isTop = (node.id === topId) || (index === 0 && !step.topId);
      const isPop = (node.id === step.popNodeId);
      const isPeek = (node.id === step.peekNodeId);
      const isHighlight = (node.id === step.highlightNodeId);
      const isNew = (node.id === step.newNodeId);

      const wrapper = document.createElement('div');
      wrapper.className = 'node-card-wrapper';
      if (isNew && step.opName === 'PUSH') {
        wrapper.classList.add('animate-push-in');
      }

      const card = document.createElement('div');
      card.className = 'node-card';
      if (isTop) card.classList.add('active-top');
      if (isPop) card.classList.add('state-pop');
      if (isPeek) card.classList.add('state-peek');

      card.innerHTML = `
        <div class="node-data-box">
          <span class="node-lbl">${isTop ? 'TOP Node (Data)' : 'Node Data'}</span>
          <span class="node-val">${node.data}</span>
        </div>
        <div class="node-next-box">
          <span class="node-lbl">Next Pointer</span>
          <span class="node-next-val">${node.nextVal !== undefined ? (node.nextVal === 'NULL' ? '→ NULL' : `→ [${node.nextVal}]`) : '→ NULL'}</span>
        </div>
      `;

      wrapper.appendChild(card);

      // Connector Arrow to Next Node
      const connector = document.createElement('div');
      connector.className = 'pointer-connector';
      connector.innerHTML = `
        <div class="pointer-line"></div>
        <span>↓</span>
      `;
      wrapper.appendChild(connector);

      stackList.appendChild(wrapper);
    });

    this.stackStage.appendChild(stackList);

    // Final NULL Termination Badge
    const nullBadge = document.createElement('div');
    nullBadge.className = 'null-node-badge';
    nullBadge.textContent = 'NULL Pointer (End of Stack)';
    this.stackStage.appendChild(nullBadge);
  }

  addHistoryLog(opName, message) {
    if (!this.historyLogList) return;
    const item = document.createElement('div');
    item.className = 'history-item';
    
    let opClass = 'push';
    if (opName.includes('POP')) opClass = 'pop';
    if (opName.includes('PEEK')) opClass = 'peek';

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    item.innerHTML = `
      <span class="history-op ${opClass}">✓ ${opName}</span>
      <span>${message}</span>
      <span class="history-time">${now}</span>
    `;
    this.historyLogList.prepend(item);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StackVisualizer;
}
