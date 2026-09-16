/**
 * Application Controller & Event Listeners for Circular Queue ADT Visualizer
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new CircularQueueEngine(5);
  const visualizer = new CircularQueueVisualizer();

  // DOM Elements - Operations
  const valInput = document.getElementById('valInput');
  const inputError = document.getElementById('inputError');

  const enqueueBtn = document.getElementById('enqueueBtn');
  const dequeueBtn = document.getElementById('dequeueBtn');
  const displayBtn = document.getElementById('displayBtn');
  const isEmptyBtn = document.getElementById('isEmptyBtn');
  const isFullBtn = document.getElementById('isFullBtn');
  const resetBtn = document.getElementById('resetBtn');
  const randomEnqueueBtn = document.getElementById('randomEnqueueBtn');
  const presetDemoBtn = document.getElementById('presetDemoBtn');

  // DOM Elements - Navigation & Playback
  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('restartBtn');
  const speedSlider = document.getElementById('speedSlider');
  const timelineSlider = document.getElementById('timelineSlider');

  // View Mode Buttons
  const viewBothBtn = document.getElementById('viewBothBtn');
  const viewRibbonBtn = document.getElementById('viewRibbonBtn');
  const viewRingBtn = document.getElementById('viewRingBtn');

  // Theme & Code
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const copyCodeBtn = document.getElementById('copyCodeBtn');

  // Playback Control States
  let isPlaying = false;
  let playTimer = null;
  let playbackSpeed = 700; // ms per step
  let currentStepIdx = 0;

  // Initialize theme from localStorage or default dark
  initTheme();

  // Load initial demo sequence: 10, 20, 30
  engine.reset();
  engine.enqueue(10);
  engine.enqueue(20);
  engine.enqueue(30);

  currentStepIdx = engine.getTotalSteps() - 1;
  updateVisualizerState();

  function parseValInput() {
    const raw = valInput.value.trim();
    if (!raw) return null;
    const num = Number(raw);
    if (isNaN(num) || !Number.isInteger(num) || Math.abs(num) > 9999) {
      return null;
    }
    return num;
  }

  function showInputError(show) {
    if (inputError) {
      if (show) inputError.classList.add('active');
      else inputError.classList.remove('active');
    }
  }

  function updateVisualizerState() {
    const total = engine.getTotalSteps();
    if (currentStepIdx < 0) currentStepIdx = 0;
    if (currentStepIdx >= total) currentStepIdx = total - 1;

    const step = engine.getStep(currentStepIdx);
    visualizer.renderStep(step, total);

    if (playBtn) {
      playBtn.textContent = isPlaying ? '❚❚ Pause' : '▶ Play';
      playBtn.className = isPlaying ? 'btn btn-amber' : 'btn btn-primary';
    }

    if (prevBtn) prevBtn.disabled = (currentStepIdx === 0);
    if (nextBtn) nextBtn.disabled = (currentStepIdx === total - 1);
  }

  function stepForward() {
    const total = engine.getTotalSteps();
    if (currentStepIdx < total - 1) {
      currentStepIdx++;
      updateVisualizerState();
    } else {
      pausePlayback();
    }
  }

  function stepBackward() {
    if (currentStepIdx > 0) {
      currentStepIdx--;
      updateVisualizerState();
    }
  }

  function startPlayback() {
    if (currentStepIdx >= engine.getTotalSteps() - 1) {
      currentStepIdx = 0;
    }
    isPlaying = true;
    updateVisualizerState();
    playTimer = setInterval(stepForward, playbackSpeed);
  }

  function pausePlayback() {
    isPlaying = false;
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    updateVisualizerState();
  }

  function togglePlayback() {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  // --- Operations Event Handlers ---

  enqueueBtn?.addEventListener('click', () => {
    pausePlayback();
    const val = parseValInput();
    if (val === null) {
      showInputError(true);
      return;
    }
    showInputError(false);

    const prevTotal = engine.getTotalSteps();
    const success = engine.enqueue(val);
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();

    if (success) {
      visualizer.addHistoryLog('ENQUEUE', `Enqueued ${val} at rear`, 'enqueue');
      valInput.value = Math.floor(Math.random() * 80 + 10);
    } else {
      visualizer.addHistoryLog('FULL REJECTED', `Cannot enqueue ${val} (Queue Full)`, 'full');
    }
  });

  dequeueBtn?.addEventListener('click', () => {
    pausePlayback();
    const deleted = engine.dequeue();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();

    if (deleted !== null) {
      visualizer.addHistoryLog('DEQUEUE', `Deleted ${deleted} from front`, 'dequeue');
    } else {
      visualizer.addHistoryLog('EMPTY REJECTED', `Cannot dequeue (Queue Empty)`, 'empty');
    }
  });

  displayBtn?.addEventListener('click', () => {
    pausePlayback();
    const elems = engine.display();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    visualizer.addHistoryLog('DISPLAY', `Queue has ${elems.length} active element(s)`, 'enqueue');
  });

  isEmptyBtn?.addEventListener('click', () => {
    pausePlayback();
    const empty = engine.isQueueEmpty();
    engine.recordStep({
      opName: 'CHECK: IS EMPTY',
      codeLine: engine.cppLines.DEQUEUE_CHECK_EMPTY,
      variableDelta: `front == -1 ? ${empty ? 'TRUE' : 'FALSE'}`,
      description: `Testing isEmpty(): front == -1. FRONT is currently ${engine.front}. Result: Queue is ${empty ? 'EMPTY' : 'NOT EMPTY'}.`,
      operationDetail: {
        action: 'IsEmpty',
        value: empty ? 'TRUE' : 'FALSE',
        resultMessage: empty ? 'Queue is Empty' : 'Queue Not Empty',
        statusType: empty ? 'amber' : 'success'
      },
      microSteps: [
        { text: `1. Check if front == -1`, active: true },
        { text: `2. front = ${engine.front}`, active: true },
        { text: `3. Result: ${empty ? 'TRUE' : 'FALSE'}`, active: true }
      ]
    });
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
  });

  isFullBtn?.addEventListener('click', () => {
    pausePlayback();
    const full = engine.isQueueFull();
    const nextR = (engine.rear + 1) % engine.capacity;
    engine.recordStep({
      opName: 'CHECK: IS FULL',
      codeLine: engine.cppLines.ENQUEUE_CHECK_FULL,
      variableDelta: `(rear + 1) % 5 = (${engine.rear} + 1) % 5 = ${nextR} == front(${engine.front}) ? ${full ? 'TRUE' : 'FALSE'}`,
      description: `Testing isFull(): (rear + 1) % 5 == front. (${engine.rear} + 1) % 5 = ${nextR}, front = ${engine.front}. Result: Queue is ${full ? 'FULL' : 'NOT FULL'}.`,
      operationDetail: {
        action: 'IsFull',
        value: full ? 'TRUE' : 'FALSE',
        resultMessage: full ? 'Queue is Full' : 'Space Available',
        statusType: full ? 'danger' : 'success'
      },
      microSteps: [
        { text: `1. Calculate (rear + 1) % 5 = ${nextR}`, active: true },
        { text: `2. Compare with front = ${engine.front}`, active: true },
        { text: `3. Result: ${full ? 'FULL' : 'SPACE AVAILABLE'}`, active: true }
      ]
    });
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
  });

  resetBtn?.addEventListener('click', () => {
    pausePlayback();
    engine.reset();
    currentStepIdx = 0;
    updateVisualizerState();
    visualizer.addHistoryLog('RESET', 'Queue cleared and reset to initial state', 'dequeue');
  });

  randomEnqueueBtn?.addEventListener('click', () => {
    pausePlayback();
    const randomVal = Math.floor(Math.random() * 90 + 10);
    valInput.value = randomVal;
    const success = engine.enqueue(randomVal);
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    if (success) {
      visualizer.addHistoryLog('RANDOM ENQUEUE', `Enqueued ${randomVal}`, 'enqueue');
    }
  });

  // Run C++ Demo matching the user's exact main() execution sequence
  presetDemoBtn?.addEventListener('click', () => {
    pausePlayback();
    engine.reset();

    // Sequence: 10, 20, 30, 40, 50 -> Dequeue x2 -> Enqueue 60, 70 -> Display
    engine.enqueue(10);
    engine.enqueue(20);
    engine.enqueue(30);
    engine.enqueue(40);
    engine.enqueue(50);
    engine.display();

    engine.dequeue();
    engine.dequeue();

    engine.enqueue(60);
    engine.enqueue(70);
    engine.display();

    currentStepIdx = 0;
    updateVisualizerState();
    visualizer.addHistoryLog('RUN C++ DEMO', 'Loaded 10,20,30,40,50 -> Deq x2 -> 60,70 wrap demo!', 'enqueue');

    // Automatically begin playback
    startPlayback();
  });

  // --- Navigation & Playback Event Handlers ---

  playBtn?.addEventListener('click', togglePlayback);
  prevBtn?.addEventListener('click', () => {
    pausePlayback();
    stepBackward();
  });
  nextBtn?.addEventListener('click', () => {
    pausePlayback();
    stepForward();
  });
  restartBtn?.addEventListener('click', () => {
    pausePlayback();
    currentStepIdx = 0;
    updateVisualizerState();
  });

  speedSlider?.addEventListener('input', (e) => {
    playbackSpeed = Number(e.target.value);
    if (isPlaying) {
      pausePlayback();
      startPlayback();
    }
  });

  timelineSlider?.addEventListener('input', (e) => {
    pausePlayback();
    currentStepIdx = Number(e.target.value) - 1;
    updateVisualizerState();
  });

  valInput?.addEventListener('input', () => showInputError(false));
  valInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      enqueueBtn?.click();
    }
  });

  // --- View Mode Tabs ---
  function setActiveTab(btn) {
    [viewBothBtn, viewRibbonBtn, viewRingBtn].forEach(b => b?.classList.remove('active'));
    btn?.classList.add('active');
  }

  viewBothBtn?.addEventListener('click', () => {
    setActiveTab(viewBothBtn);
    visualizer.setViewMode('both');
  });
  viewRibbonBtn?.addEventListener('click', () => {
    setActiveTab(viewRibbonBtn);
    visualizer.setViewMode('ribbon');
  });
  viewRingBtn?.addEventListener('click', () => {
    setActiveTab(viewRingBtn);
    visualizer.setViewMode('ring');
  });

  // --- Copy Code Button ---
  copyCodeBtn?.addEventListener('click', () => {
    const code = document.getElementById('fullCppCodeBlock')?.innerText;
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        copyCodeBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyCodeBtn.textContent = 'Copy Code';
        }, 2000);
      });
    }
  });

  // --- Theme Toggle ---
  themeToggleBtn?.addEventListener('click', toggleTheme);

  function initTheme() {
    const savedTheme = localStorage.getItem('aniket-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      updateThemeBtn(true);
    } else {
      document.body.classList.remove('light-mode');
      updateThemeBtn(false);
    }
  }

  function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('aniket-theme', isLight ? 'light' : 'dark');
    updateThemeBtn(isLight);
  }

  function updateThemeBtn(isLight) {
    const themeLabel = document.getElementById('themeLabel');
    const themeIcon = document.getElementById('themeIcon');
    if (themeLabel) themeLabel.textContent = isLight ? 'Dark' : 'Light';
    if (themeIcon) {
      themeIcon.innerHTML = isLight
        ? `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
        : `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.7 6.7 0 0 0 9.8 9.8Z"/></svg>`;
    }
  }
});
