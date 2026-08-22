/**
 * Visualizer Controller & UI Renderer for Radix Sort
 */

class RadixSortVisualizer {
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
    this.bucketsContainer = document.getElementById('bucketsContainer');
    this.countGrid = document.getElementById('countGrid');
    this.outputBoxes = document.getElementById('outputBoxes');
    
    // Stats & Variables
    this.statPasses = document.getElementById('statPasses');
    this.statElements = document.getElementById('statElements');
    this.statOps = document.getElementById('statOps');
    this.statMaxVal = document.getElementById('statMaxVal');
    this.statExp = document.getElementById('statExp');

    this.varN = document.getElementById('varN');
    this.varExp = document.getElementById('varExp');
    this.varI = document.getElementById('varI');
    this.varDigit = document.getElementById('varDigit');

    // Pass Tracker
    this.passOnes = document.getElementById('passOnes');
    this.passTens = document.getElementById('passTens');
    this.passHundreds = document.getElementById('passHundreds');
    this.passSubtitle = document.getElementById('passSubtitle');
    this.digitFormulaVal = document.getElementById('digitFormulaVal');

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
    this.resultPasses = document.getElementById('resultPasses');
    this.resultDigits = document.getElementById('resultDigits');
    this.resultElements = document.getElementById('resultElements');
  }

  init(initialArray) {
    this.loadArray(initialArray);
    this.initTheme();
  }

  loadArray(array) {
    this.pause();
    this.engine = new RadixSortEngine(array);
    this.currentStepIndex = 0;
    
    this.timelineSlider.max = this.engine.steps.length - 1;
    this.timelineSlider.value = 0;

    this.renderCurrentStep();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('radixsort_theme') || 'dark';
    const moonIcon = `<div class="theme-icon-circle"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg></div>`;
    const sunIcon = `<div class="theme-icon-circle"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg></div>`;
    
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      if (this.themeToggleBtn) this.themeToggleBtn.innerHTML = sunIcon;
    } else {
      document.body.classList.remove('light-mode');
      if (this.themeToggleBtn) this.themeToggleBtn.innerHTML = moonIcon;
    }
  }

  toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    const newTheme = isLight ? 'light' : 'dark';
    localStorage.setItem('radixsort_theme', newTheme);
    const moonIcon = `<div class="theme-icon-circle"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg></div>`;
    const sunIcon = `<div class="theme-icon-circle"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg></div>`;
    if (this.themeToggleBtn) this.themeToggleBtn.innerHTML = isLight ? sunIcon : moonIcon;
  }

  renderCurrentStep() {
    if (!this.engine || !this.engine.steps.length) return;

    const step = this.engine.steps[this.currentStepIndex];
    const totalSteps = this.engine.steps.length;

    // 1. Sliders & Step Counter
    this.timelineSlider.value = this.currentStepIndex;
    this.stepCounterText.textContent = `Step: ${this.currentStepIndex + 1} / ${totalSteps}`;

    // 2. Statistics Panel
    this.statPasses.textContent = `${step.passNum} / ${step.totalPasses}`;
    this.statElements.textContent = step.arrState.length;
    this.statOps.textContent = step.digitOpsCount;
    this.statMaxVal.textContent = step.maxVal !== null ? step.maxVal : '—';
    this.statExp.textContent = step.exp !== null ? step.exp : '—';

    // 3. Variables Tracker Bar
    this.varN.textContent = step.arrState.length;
    this.varExp.textContent = step.exp !== null ? step.exp : '—';
    this.varI.textContent = step.i !== null ? step.i : '—';
    this.varDigit.textContent = step.digit !== null ? step.digit : '—';

    // 4. Pass Tracker Pills
    this.updatePassTracker(step);

    // 5. Render Main Array Canvas
    this.renderArrayCanvas(step);

    // 6. Render 10 Digit Buckets
    this.renderBuckets(step);

    // 7. Render Counting Array Grid
    this.renderCountGrid(step);

    // 8. Render Output Array Row
    this.renderOutputArray(step);

    // 9. Highlight C++ Line (with smooth auto-scrolling)
    this.highlightCppLine(step.cLine);

    // 10. Render Operation Details & Execution Box
    this.renderOperationDetails(step);

    // 11. Result Card
    if (step.type === 'SORT_COMPLETE') {
      this.showResultCard(step);
    } else {
      this.resultCard.classList.remove('active');
    }
  }

  updatePassTracker(step) {
    if (this.passSubtitle) {
      this.passSubtitle.textContent = step.exp ? `Pass ${step.passNum} of ${step.totalPasses} (Place: ${step.passName}, exp = ${step.exp})` : 'Radix Sort Complete';
    }

    if (this.digitFormulaVal && step.i !== null && step.exp && step.arrState[step.i] !== undefined) {
      const num = step.arrState[step.i];
      const div = Math.floor(num / step.exp);
      const digit = div % 10;
      this.digitFormulaVal.textContent = `(${num} / ${step.exp}) % 10 = ${div} % 10 = ${digit}`;
    } else if (this.digitFormulaVal) {
      this.digitFormulaVal.textContent = '—';
    }

    // Pills
    if (this.passOnes) {
      this.passOnes.className = 'pass-pill';
      if (step.exp > 1 || step.type === 'SORT_COMPLETE') this.passOnes.classList.add('done');
      else if (step.exp === 1) this.passOnes.classList.add('active');
    }

    if (this.passTens) {
      this.passTens.className = 'pass-pill';
      if (step.exp > 10 || step.type === 'SORT_COMPLETE') this.passTens.classList.add('done');
      else if (step.exp === 10) this.passTens.classList.add('active');
    }

    if (this.passHundreds) {
      this.passHundreds.className = 'pass-pill';
      if (step.exp > 100 || step.type === 'SORT_COMPLETE') this.passHundreds.classList.add('done');
      else if (step.exp === 100) this.passHundreds.classList.add('active');
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

      // State determination for Radix Sort
      let state = 'normal';
      if (step.type === 'SORT_COMPLETE') {
        state = 'sorted';
      } else if (step.type === 'COPY_BACK' && step.activeBoxIndex === idx) {
        state = 'copying';
      } else if (idx === step.activeBoxIndex) {
        state = 'active-num';
      }

      boxEl.classList.add(state);
      boxEl.textContent = val;

      // Pointer Tag badge for i
      const tagEl = document.createElement('div');
      tagEl.className = 'pointer-tag';

      if (idx === step.i && step.type !== 'SORT_COMPLETE') {
        tagEl.classList.add('visible', 'tag-i');
        tagEl.textContent = `↑ i=${idx}`;
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

  renderBuckets(step) {
    if (!this.bucketsContainer) return;
    this.bucketsContainer.innerHTML = '';

    for (let b = 0; b < 10; b++) {
      const box = document.createElement('div');
      box.className = 'bucket-box';
      if (step.activeBucket === b) box.classList.add('active-bucket');

      const header = document.createElement('div');
      header.className = 'bucket-header';
      header.textContent = `B${b}`;

      const items = document.createElement('div');
      items.className = 'bucket-items';

      const list = step.buckets[b] || [];
      list.forEach(val => {
        const item = document.createElement('span');
        item.className = 'bucket-item-badge';
        item.textContent = val;
        items.appendChild(item);
      });

      box.appendChild(header);
      box.appendChild(items);
      this.bucketsContainer.appendChild(box);
    }
  }

  renderCountGrid(step) {
    if (!this.countGrid) return;
    this.countGrid.innerHTML = '';

    for (let d = 0; d < 10; d++) {
      const cell = document.createElement('div');
      cell.className = 'count-cell';
      if (step.activeBucket === d) cell.style.borderColor = '#6366f1';

      const digitLabel = document.createElement('span');
      digitLabel.className = 'c-digit';
      digitLabel.textContent = `d=${d}`;

      const valLabel = document.createElement('span');
      valLabel.className = 'c-val';
      valLabel.textContent = step.count[d];

      cell.appendChild(digitLabel);
      cell.appendChild(valLabel);
      this.countGrid.appendChild(cell);
    }
  }

  renderOutputArray(step) {
    if (!this.outputBoxes) return;
    this.outputBoxes.innerHTML = '';

    step.output.forEach((val, idx) => {
      const box = document.createElement('div');
      box.className = 'output-box';
      if (val !== null) {
        box.classList.add('filled');
        box.textContent = val;
      } else {
        box.textContent = '-';
      }
      this.outputBoxes.appendChild(box);
    });
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

    if (step.digit !== null) {
      this.opComparing.textContent = `Digit Pass ${step.passName}`;
      this.opValues.textContent = `digit = ${step.digit}`;
    } else {
      this.opComparing.textContent = '—';
      this.opValues.textContent = '—';
    }

    this.opResult.textContent = step.phase || 'OK';
    this.opResult.className = 'op-val true';

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

    if (this.resultPasses) this.resultPasses.textContent = step.totalPasses;
    if (this.resultDigits) this.resultDigits.textContent = step.totalPasses;
    if (this.resultElements) this.resultElements.textContent = step.arrState.length;
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
