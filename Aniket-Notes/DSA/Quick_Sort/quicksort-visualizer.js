/**
 * Visualizer Controller & UI Renderer for Quick Sort
 */

class QuickSortVisualizer {
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
    this.recursionTreeStage = document.getElementById('recursionTreeStage');
    
    // Stats & Variables
    this.statComp = document.getElementById('statComp');
    this.statSwaps = document.getElementById('statSwaps');
    this.statPartitions = document.getElementById('statPartitions');
    this.statCalls = document.getElementById('statCalls');
    this.statSize = document.getElementById('statSize');
    this.statDepth = document.getElementById('statDepth');

    this.varN = document.getElementById('varN');
    this.varLow = document.getElementById('varLow');
    this.varHigh = document.getElementById('varHigh');
    this.varPivot = document.getElementById('varPivot');
    this.varI = document.getElementById('varI');
    this.varJ = document.getElementById('varJ');

    // Dedicated Pivot Card
    this.pivotValue = document.getElementById('pivotValue');
    this.pivotIndex = document.getElementById('pivotIndex');
    this.pivotSource = document.getElementById('pivotSource');

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
    this.resultSwaps = document.getElementById('resultSwaps');
    this.resultPartitions = document.getElementById('resultPartitions');
    this.resultCalls = document.getElementById('resultCalls');
  }

  init(initialArray) {
    this.loadArray(initialArray);
    this.initTheme();
  }

  loadArray(array) {
    this.pause();
    this.engine = new QuickSortEngine(array);
    this.currentStepIndex = 0;
    
    this.timelineSlider.max = this.engine.steps.length - 1;
    this.timelineSlider.value = 0;

    this.renderCurrentStep();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('quicksort_theme') || 'dark';
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
    localStorage.setItem('quicksort_theme', newTheme);
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
    this.statSwaps.textContent = step.swapsCount;
    this.statPartitions.textContent = step.partitionsCount;
    this.statCalls.textContent = step.recursiveCallsCount;
    this.statSize.textContent = step.arrState.length;
    this.statDepth.textContent = step.maxRecursionDepth;

    // 3. Variables Tracker Bar
    this.varN.textContent = step.arrState.length;
    this.varLow.textContent = step.low !== null ? step.low : '—';
    this.varHigh.textContent = step.high !== null ? step.high : '—';
    this.varPivot.textContent = step.pivot !== null ? step.pivot : '—';
    this.varI.textContent = step.i !== null ? step.i : '—';
    this.varJ.textContent = step.j !== null ? step.j : '—';

    // 4. Dedicated Pivot Card
    if (this.pivotValue) this.pivotValue.textContent = step.pivot !== null ? step.pivot : '—';
    if (this.pivotIndex) this.pivotIndex.textContent = step.pivotIndex !== null ? step.pivotIndex : '—';
    if (this.pivotSource) this.pivotSource.textContent = step.pivotIndex !== null ? `arr[${step.pivotIndex}]` : '—';

    // 5. Render Main Array Canvas
    this.renderArrayCanvas(step);

    // 6. Render Recursion Tree
    this.renderRecursionTree(step);

    // 7. Highlight C++ Line (with smooth auto-scrolling)
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

      // State determination for Quick Sort
      let state = 'normal';
      if (step.type === 'SORT_COMPLETE' || step.sortedIndices.includes(idx)) {
        state = 'sorted';
      } else if (step.swappedIndices.includes(idx)) {
        state = 'swapping';
      } else if (idx === step.pivotIndex && step.pivot !== null) {
        state = 'pivot-node';
      } else if (idx === step.j && step.type === 'COMPARE') {
        state = 'comparing';
      } else if (step.low !== null && step.high !== null && idx >= step.low && idx <= step.high) {
        state = 'active-partition';
      }

      boxEl.classList.add(state);
      boxEl.textContent = val;

      // Pointer Tag badges
      const tagEl = document.createElement('div');
      tagEl.className = 'pointer-tag';

      if (step.type !== 'SORT_COMPLETE') {
        let tagText = [];
        if (idx === step.pivotIndex && step.pivot !== null) tagText.push('pivot');
        if (idx === step.low) tagText.push('low');
        if (idx === step.high) tagText.push('high');
        if (idx === step.i) tagText.push('i');
        if (idx === step.j) tagText.push('j');

        if (tagText.length > 0) {
          tagEl.classList.add('visible');
          if (idx === step.pivotIndex && step.pivot !== null) tagEl.classList.add('tag-pivot');
          else if (idx === step.low) tagEl.classList.add('tag-low');
          else if (idx === step.high) tagEl.classList.add('tag-high');
          else if (idx === step.i) tagEl.classList.add('tag-i');
          else if (idx === step.j) tagEl.classList.add('tag-j');
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

  renderRecursionTree(step) {
    if (!this.recursionTreeStage) return;
    this.recursionTreeStage.innerHTML = '';

    const nodes = step.treeSnapshot || [];
    if (nodes.length === 0) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'recursion-tree-svg');
    
    // Group nodes by depth
    const depthGroups = {};
    let maxDepth = 0;
    nodes.forEach(n => {
      if (!depthGroups[n.depth]) depthGroups[n.depth] = [];
      depthGroups[n.depth].push(n);
      if (n.depth > maxDepth) maxDepth = n.depth;
    });

    const svgHeight = Math.max(380, (maxDepth + 1) * 85 + 40);
    svg.setAttribute('viewBox', `0 0 840 ${svgHeight}`);

    const nodeCoords = {};

    Object.keys(depthGroups).forEach(d => {
      const list = depthGroups[d];
      const count = list.length;
      const stepX = 840 / (count + 1);
      const y = 50 + d * 85;

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
      } else if (n.status === 'partitioned') {
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
      fnText.textContent = `quickSort(${n.left},${n.right})`;

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
      this.opComparing.textContent = `arr[${step.j}] vs pivot`;
      this.opValues.textContent = `${step.comparingVal1} vs ${step.comparingVal2}`;
    } else {
      this.opComparing.textContent = '—';
      this.opValues.textContent = '—';
    }

    this.opResult.textContent = step.comparingResult || 'OK';
    this.opResult.className = 'op-val';
    if (step.comparingResult === 'TRUE') this.opResult.classList.add('true');
    else if (step.comparingResult === 'FALSE') this.opResult.classList.add('false');
    else if (step.comparingResult && (step.comparingResult.startsWith('SWAP') || step.comparingResult.startsWith('PIVOT'))) this.opResult.classList.add('swap');

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
    this.resultSwaps.textContent = step.swapsCount;
    this.resultPartitions.textContent = step.partitionsCount;
    this.resultCalls.textContent = step.recursiveCallsCount;
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
