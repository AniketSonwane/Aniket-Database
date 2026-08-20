/**
 * Visualizer Controller & UI Renderer for Binary Search
 */

class BinarySearchVisualizer {
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
    this.unsortedWarning = document.getElementById('unsortedWarning');
    this.sortArrayBtn = document.getElementById('sortArrayBtn');
    this.arrayStage = document.getElementById('arrayStage');
    
    // Stats & Variables
    this.statComp = document.getElementById('statComp');
    this.statIter = document.getElementById('statIter');
    this.statElim = document.getElementById('statElim');
    this.statSize = document.getElementById('statSize');
    this.statTarget = document.getElementById('statTarget');

    this.varN = document.getElementById('varN');
    this.varLow = document.getElementById('varLow');
    this.varMid = document.getElementById('varMid');
    this.varHigh = document.getElementById('varHigh');
    this.varTarget = document.getElementById('varTarget');

    // Target Card & Search Space Card
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
    this.resultIter = document.getElementById('resultIter');
    this.resultTarget = document.getElementById('resultTarget');
    this.resultIndex = document.getElementById('resultIndex');
  }

  init(initialArray, target) {
    this.loadArray(initialArray, target);
    this.initTheme();
  }

  loadArray(array, target) {
    this.pause();

    // Check if array is sorted
    const isSorted = this.checkIfSorted(array);
    if (!isSorted) {
      if (this.unsortedWarning) this.unsortedWarning.classList.add('active');
    } else {
      if (this.unsortedWarning) this.unsortedWarning.classList.remove('active');
    }

    this.engine = new BinarySearchEngine(array, target);
    this.currentStepIndex = 0;
    
    this.timelineSlider.max = this.engine.steps.length - 1;
    this.timelineSlider.value = 0;

    this.renderCurrentStep();
  }

  checkIfSorted(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return false;
    }
    return true;
  }

  initTheme() {
    const savedTheme = localStorage.getItem('binarysearch_theme') || 'dark';
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
    localStorage.setItem('binarysearch_theme', newTheme);
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
    this.statComp.textContent = step.comparisonsCount;
    this.statIter.textContent = step.iterationsCount;
    this.statElim.textContent = step.eliminatedCount;
    this.statSize.textContent = step.arrState.length;
    this.statTarget.textContent = step.target;

    // 3. Variables Tracker Bar
    this.varN.textContent = step.arrState.length;
    this.varLow.textContent = step.low !== null ? step.low : '—';
    this.varMid.textContent = step.mid !== null ? step.mid : '—';
    this.varHigh.textContent = step.high !== null ? step.high : '—';
    this.varTarget.textContent = step.target;

    // 4. Target Card & Search Space Progress
    if (this.targetCardVal) this.targetCardVal.textContent = step.target;
    const remaining = Math.max(0, step.arrState.length - step.eliminatedCount);
    if (this.progressText) this.progressText.textContent = `Remaining: ${remaining} / ${step.arrState.length}`;
    if (this.progressBarFill) {
      const pct = Math.round((remaining / step.arrState.length) * 100);
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

      // State determination for Binary Search
      let state = 'normal';
      if (step.foundIndex === idx) {
        state = 'found-match';
      } else if (idx === step.mid) {
        state = 'mid-comparing';
      } else if (step.eliminatedIndices.includes(idx)) {
        state = 'eliminated';
      } else if (step.low !== null && step.high !== null && idx >= step.low && idx <= step.high) {
        state = 'active-range';
      }

      boxEl.classList.add(state);
      boxEl.textContent = val;

      // Pointer Tag Badges (low, mid, high)
      const tagEl = document.createElement('div');
      tagEl.className = 'pointer-tag';

      let tags = [];
      if (idx === step.low) tags.push('low');
      if (idx === step.mid) tags.push('mid');
      if (idx === step.high) tags.push('high');

      if (tags.length > 0 && step.searchStatus === 'searching') {
        tagEl.classList.add('visible');
        if (idx === step.mid) tagEl.classList.add('tag-mid');
        else if (idx === step.low) tagEl.classList.add('tag-low');
        else if (idx === step.high) tagEl.classList.add('tag-high');
        tagEl.textContent = `↑ ${tags.join(', ')}`;
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

    if (step.mid !== null && step.arrState[step.mid] !== undefined) {
      this.opComparing.textContent = `arr[${step.mid}] vs target`;
      this.opValues.textContent = `${step.arrState[step.mid]} vs ${step.target}`;
    } else {
      this.opComparing.textContent = '—';
      this.opValues.textContent = '—';
    }

    this.opResult.textContent = step.comparingResult || 'OK';
    this.opResult.className = 'op-val';
    if (step.comparingResult && step.comparingResult.startsWith('TRUE')) this.opResult.classList.add('true');
    else if (step.comparingResult && step.comparingResult.startsWith('FALSE')) this.opResult.classList.add('false');

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
      else if (step.eliminatedIndices.includes(idx)) box.classList.add('eliminated');
      box.textContent = val;
      this.sortedDisplay.appendChild(box);
    });

    if (this.resultComps) this.resultComps.textContent = step.comparisonsCount;
    if (this.resultIter) this.resultIter.textContent = step.iterationsCount;
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
