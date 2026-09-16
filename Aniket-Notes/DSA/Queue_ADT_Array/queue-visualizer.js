/**
 * DOM Renderer & Visualizer for Queue ADT (Array Implementation)
 * Renders horizontal array cells, FRONT/REAR pointer badges, active C++ line highlights, stats, and animations.
 */

class QueueVisualizer {
  constructor() {
    this.queueStage = document.getElementById('queueStage');
    this.linearAlertBox = document.getElementById('linearAlertBox');

    this.statSize = document.getElementById('statSize');
    this.statFrontIdx = document.getElementById('statFrontIdx');
    this.statRearIdx = document.getElementById('statRearIdx');
    this.statFrontVal = document.getElementById('statFrontVal');
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
      { line: 2, text: 'if (rear == 4) return; // Queue Overflow' },
      { line: 3, text: 'if (front == -1) front = 0;' },
      { line: 4, text: 'rear++;' },
      { line: 5, text: 'arr[rear] = value;' },
      { line: 6, text: '' },
      { line: 7, text: '// Dequeue Operation' },
      { line: 8, text: 'if (front == -1 || front > rear) return;' },
      { line: 9, text: 'int val = arr[front];' },
      { line: 10, text: 'front++;' },
      { line: 11, text: 'if (front > rear) { front = -1; rear = -1; }' },
      { line: 12, text: '' },
      { line: 13, text: '// Peek Operation' },
      { line: 14, text: 'if (front == -1) return -1;' },
      { line: 15, text: 'return arr[front];' },
      { line: 16, text: '' },
      { line: 17, text: '// IsEmpty Check' },
      { line: 18, text: 'return front == -1;' },
      { line: 19, text: '' },
      { line: 20, text: '// IsFull Check' },
      { line: 21, text: 'return rear == 4;' },
      { line: 22, text: '' },
      { line: 23, text: '// Clear Operation' },
      { line: 24, text: 'front = -1; rear = -1;' }
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
    if (this.statFrontIdx) this.statFrontIdx.textContent = step.stats.frontIndex;
    if (this.statRearIdx) this.statRearIdx.textContent = step.stats.rearIndex;
    if (this.statFrontVal) this.statFrontVal.textContent = step.stats.frontVal;
    if (this.statStatus) {
      if (step.stats.isEmpty) {
        this.statStatus.textContent = 'Empty';
        this.statStatus.style.color = '#f59e0b';
      } else if (step.stats.isFull) {
        this.statStatus.textContent = 'Full';
        this.statStatus.style.color = '#f43f5e';
      } else {
        this.statStatus.textContent = 'Not Empty';
        this.statStatus.style.color = '#10b981';
      }
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

    // 5. Linear Queue Limitation Alert Box
    if (this.linearAlertBox) {
      if (step.stats.hasLinearLimitation) {
        this.linearAlertBox.style.display = 'flex';
      } else {
        this.linearAlertBox.style.display = 'none';
      }
    }

    // 6. Update FIFO Tracking Bar
    this.renderFifoBar(step.array, step.front, step.rear);

    // 7. Render Array Queue Canvas
    this.renderQueueCanvas(step);
  }

  renderFifoBar(array, front, rear) {
    if (!this.fifoContainer) return;
    this.fifoContainer.innerHTML = '';

    if (front === -1 || front > rear) {
      const emptySpan = document.createElement('span');
      emptySpan.className = 'text-sm text-dim italic';
      emptySpan.textContent = 'Queue is empty (No elements in order)';
      this.fifoContainer.appendChild(emptySpan);
      return;
    }

    for (let i = front; i <= rear; i++) {
      const pill = document.createElement('div');
      let pillClass = 'fifo-pill';
      if (i === front) pillClass += ' front-item';
      if (i === rear) pillClass += ' rear-item';

      pill.className = pillClass;
      let label = `${array[i]}`;
      if (i === front && i === rear) label = `[FRONT & REAR: ${array[i]}]`;
      else if (i === front) label = `[FRONT: ${array[i]}]`;
      else if (i === rear) label = `[REAR: ${array[i]}]`;

      pill.textContent = label;
      this.fifoContainer.appendChild(pill);
    }
  }

  renderQueueCanvas(step) {
    if (!this.queueStage) return;
    this.queueStage.innerHTML = '';

    const array = step.array;
    const front = step.front;
    const rear = step.rear;

    // Top Pointers Indicator Row
    const pointersRow = document.createElement('div');
    pointersRow.className = 'pointers-row';

    // Calculate percent positions for FRONT and REAR badges across 5 cells
    const cellPercentWidth = 100 / array.length;
    const getBadgeLeft = (idx) => {
      const centerPercent = (idx + 0.5) * cellPercentWidth;
      return Math.max(14, Math.min(86, centerPercent));
    };

    if (front !== -1 || rear !== -1) {
      if (front === rear && front !== -1) {
        // Both FRONT and REAR at same index
        const bothBadge = document.createElement('div');
        bothBadge.className = 'pointer-badge both-badge';
        bothBadge.style.left = `${getBadgeLeft(front)}%`;
        bothBadge.style.transform = 'translateX(-50%)';
        bothBadge.innerHTML = `
          <span>FRONT & REAR (${front})</span>
          <span class="pointer-arrow-down">↓</span>
        `;
        pointersRow.appendChild(bothBadge);
      } else {
        if (front !== -1 && front <= rear) {
          const frontBadge = document.createElement('div');
          frontBadge.className = 'pointer-badge front-badge';
          frontBadge.style.left = `${getBadgeLeft(front)}%`;
          frontBadge.style.transform = 'translateX(-50%)';
          frontBadge.innerHTML = `
            <span>FRONT (${front})</span>
            <span class="pointer-arrow-down">↓</span>
          `;
          pointersRow.appendChild(frontBadge);
        }
        if (rear !== -1 && rear >= front) {
          const rearBadge = document.createElement('div');
          rearBadge.className = 'pointer-badge rear-badge';
          rearBadge.style.left = `${getBadgeLeft(rear)}%`;
          rearBadge.style.transform = 'translateX(-50%)';
          rearBadge.innerHTML = `
            <span>REAR (${rear})</span>
            <span class="pointer-arrow-down">↓</span>
          `;
          pointersRow.appendChild(rearBadge);
        }
      }
    } else {
      // Both FRONT and REAR are -1
      const uninitBadge = document.createElement('div');
      uninitBadge.className = 'pointer-badge';
      uninitBadge.style.left = '50%';
      uninitBadge.style.transform = 'translateX(-50%)';
      uninitBadge.style.borderColor = 'var(--text-dim)';
      uninitBadge.style.color = 'var(--text-dim)';
      uninitBadge.textContent = 'FRONT = -1 | REAR = -1';
      pointersRow.appendChild(uninitBadge);
    }

    this.queueStage.appendChild(pointersRow);

    // Array Cells Row Grid
    const cellsRow = document.createElement('div');
    cellsRow.className = 'array-cells-row';

    array.forEach((val, idx) => {
      const isOccupied = (val !== null) && (front !== -1) && (idx >= front) && (idx <= rear);
      const isFront = (idx === front);
      const isRear = (idx === rear);
      const isHighlight = (idx === step.highlightIndex);
      const isPeek = (idx === step.peekIndex);
      const isDequeue = (idx === step.dequeueIndex);

      const wrapper = document.createElement('div');
      wrapper.className = 'array-cell-wrapper';

      const cell = document.createElement('div');
      cell.className = 'array-cell';
      if (isOccupied) cell.classList.add('occupied');
      if (isFront && isRear) cell.classList.add('front-rear-cell');
      else if (isFront) cell.classList.add('front-cell');
      else if (isRear) cell.classList.add('rear-cell');

      if (isPeek) cell.classList.add('state-peek');
      if (isDequeue) cell.classList.add('state-dequeue');
      if (isHighlight) cell.classList.add('animate-enqueue-in');

      cell.innerHTML = `
        <span class="${isOccupied ? 'cell-val' : 'cell-empty-text'}">
          ${isOccupied ? val : (val !== null ? `<span style="opacity: 0.3;">${val}</span>` : 'Empty')}
        </span>
      `;

      const indexBadge = document.createElement('div');
      indexBadge.className = 'cell-index-badge';
      indexBadge.textContent = `Index ${idx}`;

      wrapper.appendChild(cell);
      wrapper.appendChild(indexBadge);
      cellsRow.appendChild(wrapper);
    });

    this.queueStage.appendChild(cellsRow);
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
