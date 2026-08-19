/**
 * Visualizer Controller & UI Renderer for Merge Sort
 * Uses user's C++ variable notation (low, mid, high, temp)
 */

class MergeSortVisualizer {
  constructor() {
    this.engine = null;
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.speed = 700;
    this.timer = null;

    // DOM Elements
    this.arrayInput = document.getElementById('arrayInput');
    this.inputError = document.getElementById('inputError');
    this.arrayStage = document.getElementById('arrayStage');
    this.tempArraysStage = document.getElementById('tempArraysStage');
    this.recursionTreeStage = document.getElementById('recursionTreeStage');
    
    // Stats & Variables
    this.statComp = document.getElementById('statComp');
    this.statAssignments = document.getElementById('statAssignments');
    this.statMerges = document.getElementById('statMerges');
    this.statSize = document.getElementById('statSize');
    this.statDepth = document.getElementById('statDepth');

    this.varN = document.getElementById('varN');
    this.varLow = document.getElementById('varLow');
    this.varMid = document.getElementById('varMid');
    this.varHigh = document.getElementById('varHigh');
    this.varI = document.getElementById('varI');
    this.varJ = document.getElementById('varJ');
    this.varK = document.getElementById('varK');

    // Controls
    this.playBtn = document.getElementById('playBtn');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.restartBtn = document.getElementById('restartBtn');
    this.speedSlider = document.getElementById('speedSlider');
    this.timelineSlider = document.getElementById('timelineSlider');
    this.stepCounterText = document.getElementById('stepCounterText');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');

    // Current Operation Card
    this.opComparing = document.getElementById('opComparing');
    this.opValues = document.getElementById('opValues');
    this.opCondition = document.getElementById('opCondition');
    this.opResult = document.getElementById('opResult');
    this.opAction = document.getElementById('opAction');
    this.opPhase = document.getElementById('opPhase');

    // Execution Card
    this.execLineText = document.getElementById('execLineText');
    this.execAction = document.getElementById('execAction');

    // Result Card
    this.resultCard = document.getElementById('resultCard');
    this.sortedDisplay = document.getElementById('sortedDisplay');
    this.resultComps = document.getElementById('resultComps');
    this.resultAssignments = document.getElementById('resultAssignments');
    this.resultMerges = document.getElementById('resultMerges');
    this.resultDepth = document.getElementById('resultDepth');
  }

  init(initialArray) {
    this.loadArray(initialArray);
    this.initTheme();
  }

  loadArray(array) {
    this.pause();
    this.engine = new MergeSortEngine(array);
    this.currentStepIndex = 0;
    
    this.timelineSlider.max = this.engine.steps.length - 1;
    this.timelineSlider.value = 0;

    this.renderCurrentStep();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('mergesort_theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      if (this.themeToggleBtn) this.themeToggleBtn.innerHTML = '☀ Light Theme';
    } else {
      document.body.classList.remove('light-mode');
      if (this.themeToggleBtn) this.themeToggleBtn.innerHTML = '🌙 Dark Theme';
    }
  }

  toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    const newTheme = isLight ? 'light' : 'dark';
    localStorage.setItem('mergesort_theme', newTheme);
    if (this.themeToggleBtn) this.themeToggleBtn.innerHTML = isLight ? '☀ Light Theme' : '🌙 Dark Theme';
  }

  renderCurrentStep() {
    if (!this.engine || !this.engine.steps.length) return;

    const step = this.engine.steps[this.currentStepIndex];
    const totalSteps = this.engine.steps.length;

    // 1. Sliders & Step Counter
    this.timelineSlider.value = this.currentStepIndex;
    this.stepCounterText.textContent = `Step: ${this.currentStepIndex + 1} / ${totalSteps}`;

    // 2. Statistics Panel
    this.statComp.textContent = step.comparisonsCount;
    this.statAssignments.textContent = step.assignmentsCount;
    this.statMerges.textContent = step.mergeCallsCount;
    this.statSize.textContent = step.arrState.length;
    this.statDepth.textContent = step.maxRecursionDepth;

    // 3. Variables Tracker Bar
    this.varN.textContent = step.arrState.length;
    if (this.varLow) this.varLow.textContent = step.low !== null ? step.low : '—';
    if (this.varMid) this.varMid.textContent = step.mid !== null ? step.mid : '—';
    if (this.varHigh) this.varHigh.textContent = step.high !== null ? step.high : '—';
    this.varI.textContent = step.i !== null ? step.i : '—';
    this.varJ.textContent = step.j !== null ? step.j : '—';
    this.varK.textContent = step.k !== null ? step.k : '—';

    // 4. Render Main Array Canvas
    this.renderArrayCanvas(step);

    // 5. Render Temporary Array (temp[])
    this.renderTempArray(step);

    // 6. Render Recursion Tree
    this.renderRecursionTree(step);

    // 7. Highlight C++ Line
    this.highlightCppLine(step.cLine);

    // 8. Render Operation Details & Execution Box
    this.renderOperationDetails(step);

    // 9. Result Card
    if (step.type === 'SORT_COMPLETE') {
      this.showResultCard(step);
    } else {
      this.resultCard.classList.remove('active');
    }
  }

  renderArrayCanvas(step) {
    this.arrayStage.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'array-box-row';

    step.arrState.forEach((val, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'element-wrapper';

      const boxEl = document.createElement('div');
      boxEl.className = 'num-box';

      // State determination
      let state = 'normal';
      if (step.type === 'SORT_COMPLETE') {
        state = 'sorted';
      } else if (step.highlightedIndices.includes(idx)) {
        state = 'swapping';
      } else if (idx === step.i || idx === step.j) {
        state = 'comparing';
      } else if (step.low !== null && step.high !== null && idx >= step.low && idx <= step.high) {
        if (step.mid !== null && idx <= step.mid) state = 'left-half';
        else if (step.mid !== null && idx > step.mid) state = 'right-half';
        else state = 'active-subarray';
      }

      boxEl.classList.add(state);
      boxEl.textContent = val;

      // Pointer Tag badges
      const tagEl = document.createElement('div');
      tagEl.className = 'pointer-tag';

      if (step.type !== 'SORT_COMPLETE') {
        let tagText = [];
        if (idx === step.low) tagText.push('low');
        if (idx === step.mid) tagText.push('mid');
        if (idx === step.high) tagText.push('high');

        if (tagText.length > 0) {
          tagEl.classList.add('visible');
          if (idx === step.low) tagEl.classList.add('tag-left');
          else if (idx === step.mid) tagEl.classList.add('tag-mid');
          else if (idx === step.high) tagEl.classList.add('tag-right');
          tagEl.textContent = `↑ ${tagText.join(', ')}`;
        }
      }

      const idxEl = document.createElement('div');
      idxEl.className = 'box-index';
      idxEl.textContent = idx;

      wrapper.appendChild(boxEl);
      wrapper.appendChild(tagEl);
      wrapper.appendChild(idxEl);
      row.appendChild(wrapper);
    });

    this.arrayStage.appendChild(row);
  }

  renderTempArray(step) {
    if (!this.tempArraysStage) return;
    this.tempArraysStage.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'temp-arrays-container';

    const groupTemp = document.createElement('div');
    groupTemp.className = 'temp-array-group';
    const titleTemp = document.createElement('div');
    titleTemp.className = 'temp-array-title';
    titleTemp.textContent = `Temporary Array temp[100] (Range: ${step.low !== null ? step.low : 0} to ${step.high !== null ? step.high : step.arrState.length - 1})`;

    const rowTemp = document.createElement('div');
    rowTemp.className = 'temp-boxes-row';

    if (step.tempState && step.tempState.length > 0) {
      step.tempState.forEach((val, idx) => {
        if (step.low !== null && step.high !== null && idx >= step.low && idx <= step.high) {
          const b = document.createElement('div');
          b.className = 'num-box-sm';
          if (idx === step.k) b.classList.add('active-ptr');
          b.textContent = val !== null ? val : '—';
          rowTemp.appendChild(b);
        }
      });
    } else {
      const emptyMsg = document.createElement('span');
      emptyMsg.className = 'text-xs text-gray-500 font-mono';
      emptyMsg.textContent = '— Pending Merge —';
      rowTemp.appendChild(emptyMsg);
    }
    groupTemp.appendChild(titleTemp);
    groupTemp.appendChild(rowTemp);

    container.appendChild(groupTemp);
    this.tempArraysStage.appendChild(container);
  }

  renderRecursionTree(step) {
    if (!this.recursionTreeStage) return;
    this.recursionTreeStage.innerHTML = '';

    const nodes = step.treeSnapshot || [];
    if (nodes.length === 0) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'recursion-tree-svg');
    svg.setAttribute('viewBox', '0 0 840 370');

    // Build level mapping
    const depthGroups = {};
    nodes.forEach(n => {
      if (!depthGroups[n.depth]) depthGroups[n.depth] = [];
      depthGroups[n.depth].push(n);
    });

    const levelY = [50, 135, 220, 305];
    const nodeCoords = {};

    Object.keys(depthGroups).forEach(d => {
      const list = depthGroups[d];
      const count = list.length;
      const stepX = 840 / (count + 1);
      const y = levelY[d] || 300;

      list.forEach((n, idx) => {
        const x = stepX * (idx + 1);
        nodeCoords[n.id] = { x, y, node: n };
      });
    });

    // Draw Smooth Curved Connecting Lines
    nodes.forEach(n => {
      if (n.parentId && nodeCoords[n.parentId] && nodeCoords[n.id]) {
        const p = nodeCoords[n.parentId];
        const c = nodeCoords[n.id];

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midY = (p.y + c.y) / 2;
        const dStr = `M ${p.x} ${p.y + 18} C ${p.x} ${midY}, ${c.x} ${midY}, ${c.x} ${c.y - 18}`;
        path.setAttribute('d', dStr);
        path.setAttribute('stroke', '#64748b');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
      }
    });

    // Draw Nodes
    nodes.forEach(n => {
      const pos = nodeCoords[n.id];
      if (!pos) return;

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const isCurrentActive = (step.callId === n.id);

      // Main Capsule Box
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', pos.x - 55);
      rect.setAttribute('y', pos.y - 18);
      rect.setAttribute('width', 110);
      rect.setAttribute('height', 36);
      rect.setAttribute('rx', 12);

      if (isCurrentActive) {
        rect.setAttribute('fill', '#6366f1');
        rect.setAttribute('stroke', '#a5b4fc');
        rect.setAttribute('stroke-width', '3');
        rect.setAttribute('filter', 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.7))');
      } else if (n.status === 'merged') {
        rect.setAttribute('fill', '#059669');
        rect.setAttribute('stroke', '#10b981');
        rect.setAttribute('stroke-width', '2');
      } else {
        rect.setAttribute('fill', '#1e293b');
        rect.setAttribute('stroke', '#475569');
        rect.setAttribute('stroke-width', '1.5');
      }

      // Function Call Label above box
      const fnText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      fnText.setAttribute('x', pos.x);
      fnText.setAttribute('y', pos.y - 23);
      fnText.setAttribute('text-anchor', 'middle');
      fnText.setAttribute('fill', isCurrentActive ? '#818cf8' : '#94a3b8');
      fnText.setAttribute('font-size', '10');
      fnText.setAttribute('font-weight', '600');
      fnText.setAttribute('font-family', 'monospace');
      fnText.textContent = `mergeSort(${n.left},${n.right})`;

      // Subarray Content Text inside box
      const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valText.setAttribute('x', pos.x);
      valText.setAttribute('y', pos.y + 5);
      valText.setAttribute('text-anchor', 'middle');
      valText.setAttribute('fill', '#ffffff');
      valText.setAttribute('font-size', '12');
      valText.setAttribute('font-weight', 'bold');
      valText.setAttribute('font-family', 'monospace');
      valText.textContent = `[${n.subArray.join(',')}]`;

      group.appendChild(rect);
      group.appendChild(fnText);
      group.appendChild(valText);
      svg.appendChild(group);
    });

    this.recursionTreeStage.appendChild(svg);
  }

  highlightCppLine(lineNum) {
    const lines = document.querySelectorAll('.code-line');
    lines.forEach(line => line.classList.remove('active-line'));
    const targetLine = document.getElementById(`line-${lineNum}`);
    if (targetLine) {
      targetLine.classList.add('active-line');

      const container = targetLine.closest('.code-container');
      if (container) {
        const targetTop = targetLine.offsetTop;
        const targetHeight = targetLine.offsetHeight;
        const containerHeight = container.clientHeight;

        container.scrollTo({
          top: targetTop - (containerHeight / 2) + (targetHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }

  renderOperationDetails(step) {
    this.opPhase.textContent = step.phase || 'READY';

    if (step.comparingVal1 !== null && step.comparingVal2 !== null) {
      this.opComparing.textContent = `arr[${step.i}] vs arr[${step.j}]`;
      this.opValues.textContent = `${step.comparingVal1} vs ${step.comparingVal2}`;
    } else {
      this.opComparing.textContent = '—';
      this.opValues.textContent = '—';
    }

    this.opResult.textContent = step.comparingResult || 'OK';
    this.opResult.className = 'op-val';
    if (step.comparingResult === 'TRUE') this.opResult.classList.add('true');
    else if (step.comparingResult === 'FALSE') this.opResult.classList.add('false');
    else if (step.comparingResult && step.comparingResult.startsWith('COPY')) this.opResult.classList.add('swap');

    this.opCondition.textContent = step.action || 'Ready';
    this.opAction.textContent = step.nextOp || 'Ready';

    // Execution Card
    const lineElement = document.getElementById(`line-${step.cLine}`);
    const lineText = lineElement ? lineElement.querySelector('.code-text').textContent.trim() : `Line ${step.cLine}`;

    this.execLineText.textContent = `Line ${step.cLine}:  ${lineText}`;
    this.execAction.textContent = `${step.action}. Next: ${step.nextOp}`;
  }

  showResultCard(step) {
    this.resultCard.classList.add('active');
    this.sortedDisplay.innerHTML = '';
    
    step.arrState.forEach(val => {
      const box = document.createElement('div');
      box.className = 'num-box sorted';
      box.textContent = val;
      this.sortedDisplay.appendChild(box);
    });

    this.resultComps.textContent = step.comparisonsCount;
    this.resultAssignments.textContent = step.assignmentsCount;
    this.resultMerges.textContent = step.mergeCallsCount;
    this.resultDepth.textContent = step.maxRecursionDepth;
  }

  // Playback Controls
  play() {
    if (this.isPlaying) return;
    if (this.currentStepIndex >= this.engine.steps.length - 1) {
      this.currentStepIndex = 0;
    }
    this.isPlaying = true;
    this.playBtn.innerHTML = '⏸ Pause';
    this.playBtn.classList.add('playing');

    this.timer = setInterval(() => {
      if (this.currentStepIndex < this.engine.steps.length - 1) {
        this.currentStepIndex++;
        this.renderCurrentStep();
      } else {
        this.pause();
      }
    }, this.speed);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.playBtn.innerHTML = '▶ Play';
    this.playBtn.classList.remove('playing');
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextStep() {
    this.pause();
    if (this.currentStepIndex < this.engine.steps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentStep();
    }
  }

  prevStep() {
    this.pause();
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderCurrentStep();
    }
  }

  restart() {
    this.pause();
    this.currentStepIndex = 0;
    this.renderCurrentStep();
  }

  setSpeed(ms) {
    this.speed = ms;
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  seekToStep(index) {
    this.pause();
    this.currentStepIndex = Math.max(0, Math.min(index, this.engine.steps.length - 1));
    this.renderCurrentStep();
  }
}
