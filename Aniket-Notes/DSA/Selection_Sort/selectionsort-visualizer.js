/**
 * Visualizer Controller & UI Renderer for Selection Sort
 */

class SelectionSortVisualizer {
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
    
    // Stats & Variables
    this.statComp = document.getElementById('statComp');
    this.statSwaps = document.getElementById('statSwaps');
    this.statPasses = document.getElementById('statPasses');
    this.statSize = document.getElementById('statSize');

    this.varN = document.getElementById('varN');
    this.varI = document.getElementById('varI');
    this.varJ = document.getElementById('varJ');
    this.varMinIndex = document.getElementById('varMinIndex');
    this.varMinValue = document.getElementById('varMinValue');
    this.varArrI = document.getElementById('varArrI');
    this.varArrJ = document.getElementById('varArrJ');

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

    // Execution Card
    this.execLineText = document.getElementById('execLineText');
    this.execAction = document.getElementById('execAction');

    // Result Card
    this.resultCard = document.getElementById('resultCard');
    this.sortedDisplay = document.getElementById('sortedDisplay');
    this.resultComps = document.getElementById('resultComps');
    this.resultSwaps = document.getElementById('resultSwaps');
    this.resultPasses = document.getElementById('resultPasses');
  }

  init(initialArray) {
    this.loadArray(initialArray);
    this.initTheme();
  }

  loadArray(array) {
    this.pause();
    this.engine = new SelectionSortEngine(array);
    this.currentStepIndex = 0;
    
    this.timelineSlider.max = this.engine.steps.length - 1;
    this.timelineSlider.value = 0;

    this.renderCurrentStep();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('selectionsort_theme') || 'dark';
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
    localStorage.setItem('selectionsort_theme', newTheme);
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
    this.statPasses.textContent = step.passesCount;
    this.statSize.textContent = step.n;

    // 3. Variables Tracker Bar
    this.varN.textContent = step.n;
    this.varI.textContent = step.i;
    this.varJ.textContent = step.j;
    this.varMinIndex.textContent = step.minIndex;
    this.varMinValue.textContent = step.minValue !== undefined ? step.minValue : '—';
    this.varArrI.textContent = step.arrState[step.i] !== undefined ? step.arrState[step.i] : '—';
    this.varArrJ.textContent = step.arrState[step.j] !== undefined ? step.arrState[step.j] : '—';

    // 4. Render Array Canvas & Boxes
    this.renderArrayCanvas(step);

    // 5. Highlight C++ Line
    this.highlightCppLine(step.cLine);

    // 6. Render Operation Card & Execution Explanation
    this.renderOperationDetails(step);

    // 7. Result Card
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

      // Determine state for Selection Sort
      let state = 'normal';
      if (step.type === 'SORT_COMPLETE' || step.sortedIndices.includes(idx)) {
        state = 'sorted';
      } else if (step.swappedIndices.includes(idx)) {
        state = 'swapping';
      } else if (idx === step.minIndex) {
        state = 'min-index';
      } else if (idx === step.i) {
        state = 'current-i';
      } else if (idx === step.j) {
        state = 'comparing';
      }

      boxEl.classList.add(state);
      boxEl.textContent = val;

      // Pointer Tags (i, j, minIndex)
      const tagEl = document.createElement('div');
      tagEl.className = 'pointer-tag';

      if (step.type !== 'SORT_COMPLETE') {
        let tagText = [];
        if (idx === step.i) tagText.push(`i=${idx}`);
        if (idx === step.j) tagText.push(`j=${idx}`);
        if (idx === step.minIndex) tagText.push(`min=${idx}`);

        if (tagText.length > 0) {
          tagEl.classList.add('visible');
          if (idx === step.minIndex) tagEl.classList.add('tag-min');
          else if (idx === step.i) tagEl.classList.add('tag-i');
          else if (idx === step.j) tagEl.classList.add('tag-j');
          tagEl.textContent = `↑ ${tagText.join(', ')}`;
        }
      }

      // Index label below
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

  highlightCppLine(lineNum) {
    const lines = document.querySelectorAll('.code-line');
    lines.forEach(line => line.classList.remove('active-line'));
    const targetLine = document.getElementById(`line-${lineNum}`);
    if (targetLine) {
      targetLine.classList.add('active-line');
    }
  }

  renderOperationDetails(step) {
    const op = step.opDetails;

    // Operation Card Top Row Metrics
    if (step.comparingIndices.length > 0) {
      this.opComparing.textContent = op.comparing;
      this.opValues.textContent = `${op.valJ} vs ${op.valMin}`;
    } else {
      this.opComparing.textContent = op.comparing || '—';
      this.opValues.textContent = '—';
    }

    // Result color text
    this.opResult.textContent = op.result;
    this.opResult.className = 'op-val';
    if (op.result === 'TRUE') this.opResult.classList.add('true');
    else if (op.result === 'FALSE') this.opResult.classList.add('false');
    else if (op.result === 'SWAPPED' || op.result === 'NEW MIN' || op.result === 'SET MIN') this.opResult.classList.add('swap');

    // Bottom Info Lines
    this.opCondition.textContent = op.condition || '—';
    this.opAction.textContent = op.action || 'Ready';

    // Execution Card (Right side)
    const lineElement = document.getElementById(`line-${step.cLine}`);
    const lineText = lineElement ? lineElement.querySelector('.code-text').textContent.trim() : `Line ${step.cLine}`;

    this.execLineText.textContent = `Line ${step.cLine}:  ${lineText}`;
    this.execAction.textContent = `${op.action}. Next: ${op.nextOp}`;
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
    this.resultPasses.textContent = step.passesCount;
  }

  // Playback Control Methods
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
