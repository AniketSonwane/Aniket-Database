/**
 * Application Entry Point & Event Controller for Queue ADT Visualizer
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new QueueEngine(5);
  const visualizer = new QueueVisualizer();

  // DOM Elements
  const valInput = document.getElementById('valInput');
  const inputError = document.getElementById('inputError');

  const enqueueBtn = document.getElementById('enqueueBtn');
  const dequeueBtn = document.getElementById('dequeueBtn');
  const peekBtn = document.getElementById('peekBtn');
  const isEmptyBtn = document.getElementById('isEmptyBtn');
  const isFullBtn = document.getElementById('isFullBtn');
  const clearBtn = document.getElementById('clearBtn');
  const randomEnqueueBtn = document.getElementById('randomEnqueueBtn');
  const presetDemoBtn = document.getElementById('presetDemoBtn');

  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('restartBtn');
  const speedSlider = document.getElementById('speedSlider');
  const timelineSlider = document.getElementById('timelineSlider');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const copyCodeBtn = document.getElementById('copyCodeBtn');

  // Playback Control States
  let isPlaying = false;
  let playTimer = null;
  let playbackSpeed = 700; // ms per step

  // Initial Setup: Reset engine and load default items (10, 20, 30)
  engine.reset();
  engine.enqueue(10);
  engine.enqueue(20);
  engine.enqueue(30);

  let currentStepIdx = engine.getTotalSteps() - 1;
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

  function togglePlay() {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  // --- Handlers for Queue Operations ---
  function handleEnqueue() {
    const val = parseValInput();
    if (val === null) {
      if (inputError) {
        inputError.textContent = 'Please enter a valid integer between -9999 and 9999.';
        inputError.classList.add('active');
      }
      return;
    }
    if (inputError) inputError.classList.remove('active');

    pausePlayback();
    const success = engine.enqueue(val);
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    
    if (success) {
      visualizer.addHistoryLog(`ENQUEUE ${val}`, `Added ${val} to REAR.`);
    } else {
      visualizer.addHistoryLog('ENQUEUE (Overflow)', 'Queue is full.');
    }
    valInput.value = '';
  }

  function handleDequeue() {
    pausePlayback();
    const success = engine.dequeue();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    if (success) {
      visualizer.addHistoryLog('DEQUEUE', 'Removed element from FRONT.');
    } else {
      visualizer.addHistoryLog('DEQUEUE (Underflow)', 'Attempted dequeue on empty queue.');
    }
  }

  function handlePeek() {
    pausePlayback();
    const frontVal = engine.peek();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    if (frontVal !== null) {
      visualizer.addHistoryLog('PEEK', `Inspected FRONT element: ${frontVal}`);
    } else {
      visualizer.addHistoryLog('PEEK (Empty)', 'Queue is empty.');
    }
  }

  function handleIsEmpty() {
    pausePlayback();
    const empty = engine.isEmpty();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    visualizer.addHistoryLog('ISEMPTY', `Result: ${empty ? 'Empty' : 'Not Empty'}`);
  }

  function handleIsFull() {
    pausePlayback();
    const full = engine.isFull();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    visualizer.addHistoryLog('ISFULL', `Result: ${full ? 'Full' : 'Not Full'}`);
  }

  function handleClear() {
    pausePlayback();
    engine.clear();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    visualizer.addHistoryLog('CLEAR', 'Cleared all elements from queue.');
  }

  function handleRandomEnqueue() {
    const randomVal = Math.floor(Math.random() * 90) + 10;
    valInput.value = randomVal;
    handleEnqueue();
  }

  function handlePresetDemo() {
    pausePlayback();
    engine.reset();
    engine.enqueue(10);
    engine.enqueue(20);
    engine.enqueue(30);
    engine.enqueue(40);
    currentStepIdx = 0;
    updateVisualizerState();
    startPlayback();
    visualizer.addHistoryLog('PRESET DEMO', 'Loaded demo sequence (10, 20, 30, 40).');
  }

  // --- Event Listeners ---
  if (enqueueBtn) enqueueBtn.addEventListener('click', handleEnqueue);
  if (dequeueBtn) dequeueBtn.addEventListener('click', handleDequeue);
  if (peekBtn) peekBtn.addEventListener('click', handlePeek);
  if (isEmptyBtn) isEmptyBtn.addEventListener('click', handleIsEmpty);
  if (isFullBtn) isFullBtn.addEventListener('click', handleIsFull);
  if (clearBtn) clearBtn.addEventListener('click', handleClear);
  if (randomEnqueueBtn) randomEnqueueBtn.addEventListener('click', handleRandomEnqueue);
  if (presetDemoBtn) presetDemoBtn.addEventListener('click', handlePresetDemo);

  if (valInput) {
    valInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleEnqueue();
    });
  }

  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (prevBtn) prevBtn.addEventListener('click', () => {
    pausePlayback();
    stepBackward();
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    pausePlayback();
    stepForward();
  });
  if (restartBtn) restartBtn.addEventListener('click', () => {
    pausePlayback();
    currentStepIdx = 0;
    updateVisualizerState();
  });

  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      playbackSpeed = Number(e.target.value);
      if (isPlaying) {
        pausePlayback();
        startPlayback();
      }
    });
  }

  if (timelineSlider) {
    timelineSlider.addEventListener('input', (e) => {
      pausePlayback();
      currentStepIdx = Number(e.target.value) - 1;
      updateVisualizerState();
    });
  }

  // --- Theme Toggle with LocalStorage ---
  function syncTheme() {
    const savedTheme = localStorage.getItem('fm_theme') || localStorage.getItem('theme') || localStorage.getItem('aniket_theme') || 'dark';
    const isLight = savedTheme === 'light';
    document.documentElement.classList.toggle('light', isLight);
    document.documentElement.classList.toggle('light-mode', isLight);
    document.documentElement.classList.toggle('dark', !isLight);
    document.documentElement.classList.toggle('dark-mode', !isLight);
    if (document.body) {
      document.body.classList.toggle('light-mode', isLight);
      document.body.classList.toggle('light', isLight);
      document.body.classList.toggle('dark-mode', !isLight);
      document.body.classList.toggle('dark', !isLight);
    }
    const themeLabel = document.getElementById('themeLabel');
    const themeIcon = document.getElementById('themeIcon');
    if (themeLabel) themeLabel.textContent = isLight ? "Dark" : "Light";
    if (themeIcon) {
      themeIcon.innerHTML = isLight
        ? `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42"/>
             <circle cx="12" cy="12" r="3.5"/>
           </svg>`
        : `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.7 6.7 0 0 0 9.8 9.8Z"/>
           </svg>`;
    }
  }
  syncTheme();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyLight = document.body.classList.contains('light-mode') || document.documentElement.classList.contains('light');
      const newTheme = isCurrentlyLight ? 'dark' : 'light';
      localStorage.setItem('fm_theme', newTheme);
      localStorage.setItem('theme', newTheme);
      localStorage.setItem('aniket_theme', newTheme);
      syncTheme();
    });
  }

  // --- C++ Syntax Highlighter & Copy Code Button Handler ---
  function highlightCppCodeElement(el) {
    if (!el || el.dataset.highlighted === "true") return;
    let raw = el.textContent || el.innerText || "";
    if (!raw.trim()) return;

    let escaped = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const tokenRegex = new RegExp([
      '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)', // 1: comments
      '(".*?")',                                // 2: strings
      '(#(?:include|define|ifndef|endif|ifdef)\\s*(&lt;[a-zA-Z0-9_.]+&gt;)?)', // 3: preprocessor
      '\\b(return|if|else|while|for|break|continue|switch|case|default)\\b', // 4: control keywords
      '\\b(class|struct|public|private|protected|using|namespace|typedef|template|typename|delete|new)\\b', // 5: keywords
      '\\b(void|int|float|double|char|bool|long|short|nullptr|NULL|true|false)\\b', // 6: types
      '\\b(cout|cin|endl)\\b',                  // 7: io
      '\\b([A-Z][a-zA-Z0-9_]*)\\b',             // 8: types/classes
      '\\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\\s*\\()', // 9: functions
      '\\b(\\d+)\\b'                            // 10: numbers
    ].join('|'), 'g');

    el.innerHTML = escaped.replace(tokenRegex, (match, comment, str, pp, header, ctrl, kw, type, io, cls, fn, num) => {
      if (comment) return `<span class="syn-cm">${comment}</span>`;
      if (str) return `<span class="syn-str">${str}</span>`;
      if (pp) {
        if (header) {
          const dir = pp.slice(0, pp.indexOf(header)).trim();
          return `<span class="syn-pp">${dir}</span> <span class="syn-str">${header}</span>`;
        }
        return `<span class="syn-pp">${pp}</span>`;
      }
      if (ctrl) return `<span class="syn-ctrl">${ctrl}</span>`;
      if (kw) return `<span class="syn-kw">${kw}</span>`;
      if (type) return `<span class="syn-type">${type}</span>`;
      if (io) return `<span class="syn-fn">${io}</span>`;
      if (cls) return `<span class="syn-type">${cls}</span>`;
      if (fn) return `<span class="syn-fn">${fn}</span>`;
      if (num) return `<span class="syn-num">${num}</span>`;
      return match;
    });

    el.dataset.highlighted = "true";
  }

  const fullCodeEl = document.getElementById('fullCppCodeBlock');
  if (fullCodeEl) highlightCppCodeElement(fullCodeEl);

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      const codeElement = document.getElementById('fullCppCodeBlock');
      if (codeElement) {
        navigator.clipboard.writeText(codeElement.textContent).then(() => {
          copyCodeBtn.textContent = 'Copied! ✓';
          setTimeout(() => { copyCodeBtn.textContent = 'Copy Code'; }, 2000);
        });
      }
    });
  }
});
