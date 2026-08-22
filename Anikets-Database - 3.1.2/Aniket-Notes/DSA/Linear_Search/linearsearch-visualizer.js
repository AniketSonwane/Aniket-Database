/**
 * Visualizer Controller & UI Renderer for Linear Search
 */

class LinearSearchVisualizer {
  constructor() {
    this.engine = null;
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.speed = 700;
    this.timer = null;

    // DOM Elements
    this.arrayInput = document.getElementById('arrayInput');
    this.targetInput = document.getElementById('targetInput');
    this.inputError = document.getElementById('inputError');
    this.arrayStage = document.getElementById('arrayStage');
    
    // Stats & Variables
    this.statComp = document.getElementById('statComp');
    this.statChecked = document.getElementById('statChecked');
    this.statSize = document.getElementById('statSize');
    this.statTarget = document.getElementById('statTarget');

    this.varN = document.getElementById('varN');
    this.varI = document.getElementById('varI');
    this.varTarget = document.getElementById('varTarget');
    this.varArrI = document.getElementById('varArrI');

    // Search Target & Progress Card
    this.targetCardVal = document.getElementById('targetCardVal');
    this.progressText = document.getElementById('progressText');
    this.progressBarFill = document.getElementById('progressBarFill');

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
    this.resultTitle = document.getElementById('resultTitle');
    this.resultComps = document.getElementById('resultComps');
    this.resultChecked = document.getElementById('resultChecked');
    this.resultTarget = document.getElementById('resultTarget');
    this.resultIndex = document.getElementById('resultIndex');
  }

  init(initialArray, target) {
    this.loadArray(initialArray, target);
    this.initTheme();
  }

  loadArray(array, target) {
    this.pause();
    this.engine = new LinearSearchEngine(array, target);
    this.currentStepIndex = 0;
    
    this.timelineSlider.max = this.engine.steps.length - 1;
    this.timelineSlider.value = 0;

    this.renderCurrentStep();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('linearsearch_theme') || 'dark';
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
    localStorage.setItem('linearsearch_theme', newTheme);
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
    this.statComp.textContent = step.comparisonCount;
    this.statChecked.textContent = step.elementsChecked;
    this.statSize.textContent = step.arrState.length;
    this.statTarget.textContent = step.target;

    // 3. Variables Tracker Bar
    this.varN.textContent = step.arrState.length;
    this.varI.textContent = step.i < step.arrState.length ? step.i : '—';
    this.varTarget.textContent = step.target;
    this.varArrI.textContent = (step.i < step.arrState.length && step.arrState[step.i] !== undefined) ? step.arrState[step.i] : '—';

    // 4. Target Card & Progress Indicator
    if (this.targetCardVal) this.targetCardVal.textContent = step.target;
    if (this.progressText) this.progressText.textContent = `Checked: ${step.elementsChecked} / ${step.arrState.length}`;
    if (this.progressBarFill) {
      const pct = Math.min(100, Math.round((step.elementsChecked / step.arrState.length) * 100));
      this.progressBarFill.style.width = `${pct}%`;
    }

    // 5. Render Main Array Canvas
    this.renderArrayCanvas(step);

    // 6. Highlight C++ Line (with smooth auto-scrolling)
    this.highlightCppLine(step.cLine);

    // 7. Render Operation Details & Execution Box
    this.renderOperationDetails(step);

    // 8. Result Card
    if (step.type === 'FOUND_RETURN' || step.type === 'NOT_FOUND_RETURN') {
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

      // State determination for Linear Search
      let state = 'normal';
      if (step.foundIndex === idx) {
        state = 'found-match';
      } else if (idx === step.i && step.type === 'COMPARE') {
        state = 'comparing';
      } else if (step.checkedIndices.includes(idx)) {
        state = 'checked-false';
      }

      boxEl.classList.add(state);
      boxEl.textContent = val;

      // Pointer Tag badge for i
      const tagEl = document.createElement('div');
      tagEl.className = 'pointer-tag';

      if (idx === step.i && step.i < step.arrState.length && step.searchStatus === 'searching') {
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

    if (step.currentElement !== null) {
      this.opComparing.textContent = `arr[${step.i}] == target`;
      this.opValues.textContent = `${step.currentElement} == ${step.target}`;
    } else {
      this.opComparing.textContent = '—';
      this.opValues.textContent = '—';
    }

    this.opResult.textContent = step.comparingResult || 'OK';
    this.opResult.className = 'op-val';
    if (step.comparingResult === 'TRUE' || step.comparingResult === 'FOUND') this.opResult.classList.add('true');
    else if (step.comparingResult === 'FALSE' || step.comparingResult === 'NOT FOUND') this.opResult.classList.add('false');

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

    if (step.searchStatus === 'found') {
      this.resultCard.classList.remove('not-found');
      if (this.resultTitle) this.resultTitle.textContent = '✓ Element Found!';
    } else {
      this.resultCard.classList.add('not-found');
      if (this.resultTitle) this.resultTitle.textContent = '✗ Element Not Found';
    }

    step.arrState.forEach((val, idx) => {
      const box = document.createElement('div');
      box.className = 'num-box';
      if (idx === step.foundIndex) box.classList.add('found-match');
      else if (step.checkedIndices.includes(idx)) box.classList.add('checked-false');
      box.textContent = val;
      this.sortedDisplay.appendChild(box);
    });

    if (this.resultComps) this.resultComps.textContent = step.comparisonCount;
    if (this.resultChecked) this.resultChecked.textContent = step.elementsChecked;
    if (this.resultTarget) this.resultTarget.textContent = step.target;
    if (this.resultIndex) this.resultIndex.textContent = step.foundIndex !== -1 ? `return ${step.foundIndex}` : 'return -1';
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
