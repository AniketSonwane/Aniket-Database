/**
 * Circular Queue ADT Visualizer & DOM Renderer
 * Renders Array Ribbon View with SVG Wrap-Around Arc,
 * 360° Circular Ring Dial View, Pointer Badges, Synchronized C++ Code,
 * FIFO Tracker, Live Stats, and Micro-Step Explanations.
 */

class CircularQueueVisualizer {
  constructor() {
    this.ribbonContainer = document.getElementById('arrayRibbonStage');
    this.ringContainer = document.getElementById('circularRingStage');
    this.wrapSvgActive = document.getElementById('wrapPathActive');
    this.wrapLabel = document.getElementById('wrapLabel');

    this.fullBanner = document.getElementById('fullBanner');
    this.emptyBanner = document.getElementById('emptyBanner');
    this.wrapBanner = document.getElementById('wrapBanner');

    // Stats
    this.statSize = document.getElementById('statSize');
    this.statFrontIdx = document.getElementById('statFrontIdx');
    this.statRearIdx = document.getElementById('statRearIdx');
    this.statFrontVal = document.getElementById('statFrontVal');
    this.statOccupied = document.getElementById('statOccupied');
    this.statEmpty = document.getElementById('statEmpty');
    this.statStatus = document.getElementById('statStatus');
    this.statEnqueues = document.getElementById('statEnqueues');
    this.statDequeues = document.getElementById('statDequeues');

    // Operation & Step
    this.opAction = document.getElementById('opAction');
    this.opValue = document.getElementById('opValue');
    this.opResult = document.getElementById('opResult');
    this.opInfoText = document.getElementById('opInfoText');
    this.stepCounterText = document.getElementById('stepCounterText');
    this.stepDescText = document.getElementById('stepDescText');
    this.microStepsList = document.getElementById('microStepsList');
    this.variableDeltaBadge = document.getElementById('variableDeltaBadge');

    this.fifoContainer = document.getElementById('fifoContainer');
    this.historyLogList = document.getElementById('historyLogList');
    this.codeLinesContainer = document.getElementById('cppCodeLines');
    this.timelineSlider = document.getElementById('timelineSlider');

    // Current View Mode: 'ribbon', 'ring', or 'both'
    this.viewMode = 'both';

    // C++ Snippet matching the User's exact Class verbatim
    this.cppSnippet = [
      { line: 1, text: '#include <iostream>' },
      { line: 2, text: 'using namespace std;' },
      { line: 3, text: '' },
      { line: 4, text: 'class CircularQueue {' },
      { line: 5, text: '    int arr[5];' },
      { line: 6, text: '    int front, rear;' },
      { line: 7, text: '' },
      { line: 8, text: 'public:' },
      { line: 9, text: '    CircularQueue() {' },
      { line: 10, text: '        front = -1;' },
      { line: 11, text: '        rear = -1;' },
      { line: 12, text: '    }' },
      { line: 13, text: '' },
      { line: 14, text: '    void enqueue(int value) {' },
      { line: 15, text: '        if ((rear + 1) % 5 == front) {' },
      { line: 16, text: '            cout << "Queue is Full\\n";' },
      { line: 17, text: '            return;' },
      { line: 18, text: '        }' },
      { line: 19, text: '' },
      { line: 20, text: '        if (front == -1)' },
      { line: 21, text: '            front = 0;' },
      { line: 22, text: '' },
      { line: 23, text: '        rear = (rear + 1) % 5;' },
      { line: 24, text: '        arr[rear] = value;' },
      { line: 25, text: '    }' },
      { line: 26, text: '' },
      { line: 27, text: '    void dequeue() {' },
      { line: 28, text: '        if (front == -1) {' },
      { line: 29, text: '            cout << "Queue is Empty\\n";' },
      { line: 30, text: '            return;' },
      { line: 31, text: '        }' },
      { line: 32, text: '' },
      { line: 33, text: '        cout << "Deleted: " << arr[front] << endl;' },
      { line: 34, text: '' },
      { line: 35, text: '        if (front == rear) {' },
      { line: 36, text: '            front = rear = -1;' },
      { line: 37, text: '        } else {' },
      { line: 38, text: '            front = (front + 1) % 5;' },
      { line: 39, text: '        }' },
      { line: 40, text: '    }' },
      { line: 41, text: '' },
      { line: 42, text: '    void display() {' },
      { line: 43, text: '        if (front == -1) {' },
      { line: 44, text: '            cout << "Queue is Empty\\n";' },
      { line: 45, text: '            return;' },
      { line: 46, text: '        }' },
      { line: 47, text: '' },
      { line: 48, text: '        int i = front;' },
      { line: 49, text: '' },
      { line: 50, text: '        while (true) {' },
      { line: 51, text: '            cout << arr[i] << " ";' },
      { line: 52, text: '            if (i == rear)' },
      { line: 53, text: '                break;' },
      { line: 54, text: '            i = (i + 1) % 5;' },
      { line: 55, text: '        }' },
      { line: 56, text: '        cout << endl;' },
      { line: 57, text: '    }' },
      { line: 58, text: '};' }
    ];

    this.renderCppCode();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const ribbonSection = document.getElementById('ribbonSection');
    const ringSection = document.getElementById('ringSection');

    if (mode === 'ribbon') {
      if (ribbonSection) ribbonSection.style.display = 'block';
      if (ringSection) ringSection.style.display = 'none';
    } else if (mode === 'ring') {
      if (ribbonSection) ribbonSection.style.display = 'none';
      if (ringSection) ringSection.style.display = 'block';
    } else {
      if (ribbonSection) ribbonSection.style.display = 'block';
      if (ringSection) ringSection.style.display = 'block';
    }
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

  highlightCodeLine(lineNum, variableDelta = '') {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active-highlight'));
    if (lineNum) {
      const activeEl = document.getElementById(`cpp-line-${lineNum}`);
      if (activeEl) {
        activeEl.classList.add('active-highlight');
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    if (this.variableDeltaBadge) {
      if (variableDelta) {
        this.variableDeltaBadge.textContent = variableDelta;
        this.variableDeltaBadge.style.display = 'inline-block';
      } else {
        this.variableDeltaBadge.style.display = 'none';
      }
    }
  }

  renderStep(step, totalSteps) {
    if (!step) return;

    // 1. Counter & Slider
    if (this.stepCounterText) {
      this.stepCounterText.textContent = `Step: ${step.stepIndex} / ${totalSteps}`;
    }
    if (this.timelineSlider) {
      this.timelineSlider.max = totalSteps;
      this.timelineSlider.value = step.stepIndex;
    }

    // 2. Code highlight & Description
    this.highlightCodeLine(step.codeLine, step.variableDelta);
    if (this.stepDescText) {
      this.stepDescText.textContent = step.description;
    }

    // 3. Micro Steps List
    this.renderMicroSteps(step.microSteps);

    // 4. Condition Banners
    this.renderBanners(step);

    // 5. Statistics
    this.renderStats(step.stats);

    // 6. Operation Card
    if (this.opAction) this.opAction.textContent = step.operationDetail.action;
    if (this.opValue) this.opValue.textContent = step.operationDetail.value;
    if (this.opResult) {
      this.opResult.textContent = step.operationDetail.resultMessage;
      this.opResult.className = `op-val ${step.operationDetail.statusType || 'success'}`;
    }
    if (this.opInfoText) this.opInfoText.textContent = step.description;

    // 7. FIFO Order Bar
    this.renderFifoBar(step.stats.activeElements, step.front, step.rear);

    // 8. Array Ribbon View (0 1 2 3 4)
    this.renderRibbonView(step);

    // 9. Circular Ring Dial View
    this.renderRingView(step);

    // 10. Wrap-Around SVG Arc Glow
    if (this.wrapSvgActive) {
      if (step.isWrapStep || step.stats.isWrapped) {
        this.wrapSvgActive.classList.add('glowing');
      } else {
        this.wrapSvgActive.classList.remove('glowing');
      }
    }
  }

  renderMicroSteps(microSteps = []) {
    if (!this.microStepsList) return;
    this.microStepsList.innerHTML = '';

    microSteps.forEach(ms => {
      const item = document.createElement('div');
      item.className = `micro-step-item ${ms.active ? 'active' : ''}`;
      item.innerHTML = `<span>${ms.active ? '▶' : '•'}</span> <span>${ms.text}</span>`;
      this.microStepsList.appendChild(item);
    });
  }

  renderBanners(step) {
    if (this.fullBanner) {
      this.fullBanner.style.display = step.isFullAlert ? 'flex' : 'none';
      if (step.isFullAlert) {
        this.fullBanner.innerHTML = `<span>🛑</span> <strong>Queue is Full!</strong> Next slot (${(step.rear + 1) % 5}) collides with FRONT (${step.front}). Enqueue rejected.`;
      }
    }

    if (this.emptyBanner) {
      this.emptyBanner.style.display = step.isEmptyAlert ? 'flex' : 'none';
      if (step.isEmptyAlert) {
        this.emptyBanner.innerHTML = `<span>⚠️</span> <strong>Queue is Empty!</strong> FRONT is -1. Dequeue rejected.`;
      }
    }

    if (this.wrapBanner) {
      this.wrapBanner.style.display = step.isWrapStep ? 'flex' : 'none';
      if (step.isWrapStep) {
        this.wrapBanner.innerHTML = `<span>🔄</span> <strong>Modulo Wrap-Around!</strong> Pointer wrapped to index 0 using <code>(% 5)</code>! Empty space reused!`;
      }
    }
  }

  renderStats(stats) {
    if (this.statSize) this.statSize.textContent = `${stats.size} / ${stats.capacity}`;
    if (this.statFrontIdx) this.statFrontIdx.textContent = stats.frontIndex;
    if (this.statRearIdx) this.statRearIdx.textContent = stats.rearIndex;
    if (this.statFrontVal) this.statFrontVal.textContent = stats.frontVal;
    if (this.statOccupied) this.statOccupied.textContent = stats.size;
    if (this.statEmpty) this.statEmpty.textContent = stats.emptyCount;
    if (this.statEnqueues) this.statEnqueues.textContent = stats.totalEnqueues;
    if (this.statDequeues) this.statDequeues.textContent = stats.totalDequeues;

    if (this.statStatus) {
      if (stats.isEmpty) {
        this.statStatus.textContent = 'Empty';
        this.statStatus.style.color = '#f59e0b';
      } else if (stats.isFull) {
        this.statStatus.textContent = 'Full';
        this.statStatus.style.color = '#f43f5e';
      } else {
        this.statStatus.textContent = stats.isWrapped ? 'Wrapped' : 'Normal';
        this.statStatus.style.color = stats.isWrapped ? '#c084fc' : '#10b981';
      }
    }
  }

  renderFifoBar(activeElements = [], front, rear) {
    if (!this.fifoContainer) return;
    this.fifoContainer.innerHTML = '';

    if (activeElements.length === 0) {
      const emptySpan = document.createElement('span');
      emptySpan.className = 'text-xs text-dim italic';
      emptySpan.textContent = 'Queue is empty (No active elements)';
      this.fifoContainer.appendChild(emptySpan);
      return;
    }

    activeElements.forEach((el, orderIdx) => {
      const pill = document.createElement('div');
      let pillClass = 'fifo-pill';
      if (el.index === front) pillClass += ' front-item';
      if (el.index === rear) pillClass += ' rear-item';

      pill.className = pillClass;
      let label = `${el.value}`;
      if (el.index === front && el.index === rear) {
        label = `[FRONT & REAR: ${el.value}]`;
      } else if (el.index === front) {
        label = `[FRONT: ${el.value}]`;
      } else if (el.index === rear) {
        label = `[REAR: ${el.value}]`;
      }

      pill.innerHTML = `<span>${label}</span> <span style="font-size: 0.65rem; opacity: 0.6;">(@${el.index})</span>`;
      this.fifoContainer.appendChild(pill);
    });
  }

  isIndexOccupied(idx, front, rear) {
    if (front === -1 || rear === -1) return false;
    if (rear >= front) {
      return idx >= front && idx <= rear;
    } else {
      // Wrapped: occupied from front to 4 AND 0 to rear
      return idx >= front || idx <= rear;
    }
  }

  renderRibbonView(step) {
    if (!this.ribbonContainer) return;
    this.ribbonContainer.innerHTML = '';

    const array = step.array;
    const front = step.front;
    const rear = step.rear;

    // 1. Pointers Indicator Row
    const pointersRow = document.createElement('div');
    pointersRow.className = 'pointers-row';

    const cellPercentWidth = 100 / array.length;

    if (front !== -1 || rear !== -1) {
      if (front === rear && front !== -1) {
        const bothBadge = document.createElement('div');
        bothBadge.className = 'pointer-badge both-badge';
        bothBadge.style.left = `calc(${front * cellPercentWidth}% + 10px)`;
        bothBadge.innerHTML = `
          <span>FRONT & REAR (${front})</span>
          <span class="pointer-arrow-down">↓</span>
        `;
        pointersRow.appendChild(bothBadge);
      } else {
        if (front !== -1) {
          const frontBadge = document.createElement('div');
          frontBadge.className = 'pointer-badge front-badge';
          frontBadge.style.left = `calc(${front * cellPercentWidth}% + 4px)`;
          frontBadge.innerHTML = `
            <span>FRONT (${front})</span>
            <span class="pointer-arrow-down">↓</span>
          `;
          pointersRow.appendChild(frontBadge);
        }
        if (rear !== -1) {
          const rearBadge = document.createElement('div');
          rearBadge.className = 'pointer-badge rear-badge';
          rearBadge.style.left = `calc(${rear * cellPercentWidth}% + 4px)`;
          rearBadge.innerHTML = `
            <span>REAR (${rear})</span>
            <span class="pointer-arrow-down">↓</span>
          `;
          pointersRow.appendChild(rearBadge);
        }
      }
    } else {
      const uninitBadge = document.createElement('div');
      uninitBadge.className = 'pointer-badge';
      uninitBadge.style.left = '50%';
      uninitBadge.style.transform = 'translateX(-50%)';
      uninitBadge.style.borderColor = 'var(--text-dim)';
      uninitBadge.style.color = 'var(--text-dim)';
      uninitBadge.textContent = 'FRONT = -1 | REAR = -1 (Empty)';
      pointersRow.appendChild(uninitBadge);
    }

    this.ribbonContainer.appendChild(pointersRow);

    // 2. Array Cells Row
    const cellsRow = document.createElement('div');
    cellsRow.className = 'array-cells-row';

    array.forEach((val, idx) => {
      const isOccupied = this.isIndexOccupied(idx, front, rear);
      const isFront = (idx === front);
      const isRear = (idx === rear);
      const isHighlight = (idx === step.highlightIndex);
      const isDequeue = (idx === step.dequeueIndex);

      const wrapper = document.createElement('div');
      wrapper.className = 'array-cell-wrapper';

      const cell = document.createElement('div');
      cell.className = 'array-cell';

      if (isOccupied) cell.classList.add('occupied');
      if (isFront && isRear) cell.classList.add('front-rear-cell');
      else if (isFront) cell.classList.add('front-cell');
      else if (isRear) cell.classList.add('rear-cell');

      if (step.stats.isFull && isOccupied) cell.classList.add('state-full');
      if (isDequeue) cell.classList.add('state-dequeue');
      if (isHighlight) cell.classList.add('animate-enqueue-in');

      cell.innerHTML = `
        <span class="${isOccupied ? 'cell-val' : 'cell-empty-text'}">
          ${isOccupied ? val : 'Empty'}
        </span>
      `;

      const indexBadge = document.createElement('div');
      indexBadge.className = 'cell-index-badge';
      indexBadge.textContent = `Index ${idx}`;

      wrapper.appendChild(cell);
      wrapper.appendChild(indexBadge);
      cellsRow.appendChild(wrapper);
    });

    this.ribbonContainer.appendChild(cellsRow);
  }

  renderRingView(step) {
    if (!this.ringContainer) return;
    this.ringContainer.innerHTML = '';

    const front = step.front;
    const rear = step.rear;
    const array = step.array;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'circular-ring-wrapper';

    // SVG background track with clockwise arrows
    const svgTrack = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgTrack.setAttribute('class', 'ring-track-svg');
    svgTrack.setAttribute('viewBox', '0 0 320 320');
    svgTrack.innerHTML = `
      <defs>
        <marker id="ringArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
        </marker>
      </defs>
      <circle cx="160" cy="160" r="115" stroke="rgba(99, 102, 241, 0.25)" stroke-width="2.5" stroke-dasharray="8 6" fill="none" />
      <path d="M 160 45 A 115 115 0 0 1 269 124" stroke="#6366f1" stroke-width="2.5" fill="none" marker-end="url(#ringArrow)" opacity="0.6" />
      <path d="M 269 124 A 115 115 0 0 1 227 253" stroke="#6366f1" stroke-width="2.5" fill="none" marker-end="url(#ringArrow)" opacity="0.6" />
      <path d="M 227 253 A 115 115 0 0 1 93 253" stroke="#6366f1" stroke-width="2.5" fill="none" marker-end="url(#ringArrow)" opacity="0.6" />
      <path d="M 93 253 A 115 115 0 0 1 51 124" stroke="#6366f1" stroke-width="2.5" fill="none" marker-end="url(#ringArrow)" opacity="0.6" />
      <path d="M 51 124 A 115 115 0 0 1 160 45" stroke="#c084fc" stroke-width="3" fill="none" marker-end="url(#ringArrow)" opacity="0.9" />
    `;
    wrapper.appendChild(svgTrack);

    // Center Status Hub
    const hub = document.createElement('div');
    hub.className = 'ring-center-hub';
    hub.innerHTML = `
      <span class="ring-hub-title">CIRCULAR</span>
      <span class="ring-hub-modulo">% 5 Ring</span>
      <span class="ring-hub-status" style="color: ${step.stats.isEmpty ? '#f59e0b' : (step.stats.isFull ? '#f43f5e' : '#10b981')}">
        ${step.stats.isEmpty ? 'EMPTY' : (step.stats.isFull ? 'FULL' : `${step.stats.size} / 5`)}
      </span>
    `;
    wrapper.appendChild(hub);

    // 5 Radial Nodes: Angles around 160,160 with radius 115
    // Node 0: Top (-90 deg = 270 deg)
    // Node 1: Top Right (270 + 72 = 342 deg)
    // Node 2: Bottom Right (342 + 72 = 54 deg)
    // Node 3: Bottom Left (54 + 72 = 126 deg)
    // Node 4: Top Left (126 + 72 = 198 deg)
    const angles = [-90, -18, 54, 126, 198];
    const radius = 115;
    const centerX = 160;
    const centerY = 160;

    array.forEach((val, idx) => {
      const rad = (angles[idx] * Math.PI) / 180;
      const x = centerX + radius * Math.cos(rad) - 32; // node is 64px wide
      const y = centerY + radius * Math.sin(rad) - 32;

      const isOccupied = this.isIndexOccupied(idx, front, rear);
      const isFront = (idx === front);
      const isRear = (idx === rear);

      const node = document.createElement('div');
      node.className = 'ring-node';
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;

      if (isOccupied) node.classList.add('occupied');
      if (isFront && isRear) node.classList.add('both-node');
      else if (isFront) node.classList.add('front-node');
      else if (isRear) node.classList.add('rear-node');

      let labelText = isOccupied ? `${val}` : '—';
      let roleLabel = '';
      if (isFront && isRear) roleLabel = 'F&R';
      else if (isFront) roleLabel = 'FRONT';
      else if (isRear) roleLabel = 'REAR';

      node.innerHTML = `
        <span class="ring-node-val">${labelText}</span>
        <span class="ring-node-idx">[${idx}] ${roleLabel}</span>
      `;

      wrapper.appendChild(node);
    });

    this.ringContainer.appendChild(wrapper);
  }

  addHistoryLog(opName, message, statusType = 'enqueue') {
    if (!this.historyLogList) return;
    const item = document.createElement('div');
    item.className = 'history-item';

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    item.innerHTML = `
      <span class="history-op ${statusType}">✓ ${opName}</span>
      <span>${message}</span>
      <span class="history-time">${now}</span>
    `;
    this.historyLogList.prepend(item);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CircularQueueVisualizer;
}
