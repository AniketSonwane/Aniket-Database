/**
 * DOM Renderer & Visualizer for Queue ADT (Linked List Implementation)
 * Renders horizontal node cards, FRONT/REAR pointer badges, active C++ line highlights, stats, and animations.
 */

class QueueVisualizer {
  constructor() {
    this.queueStage = document.getElementById('queueStage');

    this.statSize = document.getElementById('statSize');
    this.statFrontVal = document.getElementById('statFrontVal');
    this.statRearVal = document.getElementById('statRearVal');
    this.statStatus = document.getElementById('statStatus');
    this.statEnqueues = document.getElementById('statEnqueues');
    this.statDequeues = document.getElementById('statDequeues');

    this.opAction = document.getElementById('opAction');
    this.opValue = document.getElementById('opValue');
    this.opResult = document.getElementById('opResult');
    this.opInfoText = document.getElementById('opInfoText');

    this.stepCounterText = document.getElementById('stepCounterText');
    this.stepDescText = document.getElementById('stepDescText');

    this.fifoContainer = document.getElementById('fifoContainer');
    this.historyLogList = document.getElementById('historyLogList');

    this.codeLinesContainer = document.getElementById('cppCodeLines');
    this.timelineSlider = document.getElementById('timelineSlider');

    // C++ Source Code Snippet Definition
    this.cppSnippet = [
      { line: 1, text: '// Enqueue Operation' },
      { line: 2, text: 'Node* newNode = new Node(val);' },
      { line: 3, text: 'if (rear == NULL) front = rear = newNode;' },
      { line: 4, text: 'else rear->next = newNode;' },
      { line: 5, text: 'rear = newNode;' },
      { line: 6, text: '' },
      { line: 7, text: '// Dequeue Operation' },
      { line: 8, text: 'if (front == NULL) return; // Queue Underflow' },
      { line: 9, text: 'Node* temp = front;' },
      { line: 10, text: 'front = front->next;' },
      { line: 11, text: 'if (front == NULL) rear = NULL;' },
      { line: 12, text: 'delete temp;' },
      { line: 13, text: '' },
      { line: 14, text: '// Peek Operation' },
      { line: 15, text: 'if (front == NULL) return; // Empty' },
      { line: 16, text: 'return front->data;' },
      { line: 17, text: '' },
      { line: 18, text: '// IsEmpty Check' },
      { line: 19, text: 'return front == NULL;' },
      { line: 20, text: '' },
      { line: 21, text: '// Clear Operation' },
      { line: 22, text: 'while (front != NULL) dequeue();' }
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

    // 1. Update Timeline Slider & Step Counter
    if (this.stepCounterText) {
      this.stepCounterText.textContent = `Step: ${step.stepIndex} / ${totalSteps}`;
    }
    if (this.timelineSlider) {
      this.timelineSlider.max = totalSteps;
      this.timelineSlider.value = step.stepIndex;
    }

    // 2. Update Description & Code Highlight
    if (this.stepDescText) {
      this.stepDescText.textContent = step.description;
    }
    this.highlightCodeLine(step.codeLine);

    // 3. Update Statistics Panel
    if (this.statSize) this.statSize.textContent = step.stats.size;
    if (this.statFrontVal) this.statFrontVal.textContent = step.stats.frontVal;
    if (this.statRearVal) this.statRearVal.textContent = step.stats.rearVal;
    if (this.statStatus) {
      this.statStatus.textContent = step.stats.isEmpty ? 'Empty' : 'Not Empty';
      this.statStatus.style.color = step.stats.isEmpty ? '#f59e0b' : '#10b981';
    }
    if (this.statEnqueues) this.statEnqueues.textContent = step.stats.totalEnqueues;
    if (this.statDequeues) this.statDequeues.textContent = step.stats.totalDequeues;

    // 4. Update Current Operation Panel
    if (this.opAction) this.opAction.textContent = step.operationDetail.action;
    if (this.opValue) this.opValue.textContent = step.operationDetail.value;
    if (this.opResult) {
      this.opResult.textContent = step.operationDetail.resultMessage;
      this.opResult.className = `op-val ${step.operationDetail.statusType}`;
    }
    if (this.opInfoText) this.opInfoText.textContent = step.description;

    // 5. Update FIFO Tracking Bar
    this.renderFifoBar(step.nodes);

    // 6. Render Queue Node Chain Canvas
    this.renderQueueCanvas(step);
  }

  renderFifoBar(nodes) {
    if (!this.fifoContainer) return;
    this.fifoContainer.innerHTML = '';

    if (!nodes || nodes.length === 0) {
      const emptySpan = document.createElement('span');
      emptySpan.className = 'text-sm text-dim italic';
      emptySpan.textContent = 'Queue is empty (No nodes)';
      this.fifoContainer.appendChild(emptySpan);
      return;
    }

    nodes.forEach((node, index) => {
      const pill = document.createElement('div');
      let pillClass = 'fifo-pill';
      if (index === 0) pillClass += ' front-item';
      if (index === nodes.length - 1) pillClass += ' rear-item';

      pill.className = pillClass;
      let label = `${node.data}`;
      if (index === 0 && index === nodes.length - 1) label = `[FRONT & REAR: ${node.data}]`;
      else if (index === 0) label = `[FRONT: ${node.data}]`;
      else if (index === nodes.length - 1) label = `[REAR: ${node.data}]`;

      pill.textContent = label;
      this.fifoContainer.appendChild(pill);
    });
  }

  renderQueueCanvas(step) {
    if (!this.queueStage) return;
    this.queueStage.innerHTML = '';

    const nodes = step.nodes;
    const frontId = step.frontId;
    const rearId = step.rearId;

    // If Queue is Empty
    if (!nodes || nodes.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'empty-queue-placeholder';
      emptyBox.innerHTML = `
        <div class="empty-icon">📂</div>
        <p class="font-bold text-slate-300">Queue is Currently Empty</p>
        <p class="text-xs text-dim">FRONT ➔ NULL | REAR ➔ NULL</p>
      `;
      this.queueStage.appendChild(emptyBox);
      return;
    }

    // Node Chain Horizontal Wrapper Row
    const chainRow = document.createElement('div');
    chainRow.className = 'node-chain-row';

    nodes.forEach((node, index) => {
      const isFront = (node.id === frontId) || (index === 0 && !frontId);
      const isRear = (node.id === rearId) || (index === nodes.length - 1 && !rearId);
      const isDequeue = (node.id === step.dequeueNodeId);
      const isPeek = (node.id === step.peekNodeId);
      const isHighlight = (node.id === step.highlightNodeId);
      const isNew = (node.id === step.newNodeId);

      const wrapper = document.createElement('div');
      wrapper.className = 'node-wrapper';

      // Pointer Badges Above Node Card
      const badgesContainer = document.createElement('div');
      badgesContainer.className = 'node-pointer-badges';

      if (isFront && isRear) {
        const bothBadge = document.createElement('div');
        bothBadge.className = 'badge-both';
        bothBadge.textContent = 'FRONT & REAR';
        badgesContainer.appendChild(bothBadge);
      } else {
        if (isFront) {
          const frontBadge = document.createElement('div');
          frontBadge.className = 'badge-front';
          frontBadge.textContent = 'FRONT';
          badgesContainer.appendChild(frontBadge);
        }
        if (isRear) {
          const rearBadge = document.createElement('div');
          rearBadge.className = 'badge-rear';
          rearBadge.textContent = 'REAR';
          badgesContainer.appendChild(rearBadge);
        }
      }
      wrapper.appendChild(badgesContainer);

      // Node Card Structure
      const card = document.createElement('div');
      card.className = 'node-card';
      if (isFront) card.classList.add('front-active');
      if (isRear) card.classList.add('rear-active');
      if (isPeek) card.classList.add('state-peek');
      if (isDequeue) card.classList.add('state-dequeue');
      if (isNew && step.opName === 'ENQUEUE') card.classList.add('animate-enqueue-in');

      card.innerHTML = `
        <div class="node-data-box">
          <span class="node-lbl">Data</span>
          <span class="node-val">${node.data}</span>
        </div>
        <div class="node-next-box">
          <span class="node-lbl">Next</span>
          <span class="node-next-val">${node.nextVal !== undefined ? (node.nextVal === 'NULL' ? '→ NULL' : `→ [${node.nextVal}]`) : '→ NULL'}</span>
        </div>
      `;
      wrapper.appendChild(card);

      // Connector Arrow to Next Node
      const connector = document.createElement('div');
      connector.className = 'node-connector-arrow';
      connector.textContent = '➔';
      wrapper.appendChild(connector);

      chainRow.appendChild(wrapper);
    });

    // Final NULL Termination Badge
    const nullBadge = document.createElement('div');
    nullBadge.className = 'null-badge';
    nullBadge.textContent = 'NULL Pointer';
    chainRow.appendChild(nullBadge);

    this.queueStage.appendChild(chainRow);
  }

  addHistoryLog(opName, message) {
    if (!this.historyLogList) return;
    const item = document.createElement('div');
    item.className = 'history-item';
    
    let opClass = 'enqueue';
    if (opName.includes('DEQUEUE')) opClass = 'dequeue';
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
  module.exports = QueueVisualizer;
}
