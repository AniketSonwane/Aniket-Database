/**
 * Application Entry Point & Event Controller for Stack ADT Visualizer
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new StackEngine();
  const visualizer = new StackVisualizer();

  // DOM Elements
  const valInput = document.getElementById('valInput');
  const inputError = document.getElementById('inputError');

  const pushBtn = document.getElementById('pushBtn');
  const popBtn = document.getElementById('popBtn');
  const peekBtn = document.getElementById('peekBtn');
  const isEmptyBtn = document.getElementById('isEmptyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const randomPushBtn = document.getElementById('randomPushBtn');
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

  // Initial Setup: Reset engine and load default stack (10, 20, 30)
  engine.reset();
  engine.push(10);
  engine.push(20);
  engine.push(30);

  // Jump to the latest step initially
  let currentStepIdx = engine.getTotalSteps() - 1;
  updateVisualizerState();

  // Helper to validate integer input
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

    // Update play button state
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
      currentStepIdx = 0; // Loop back to start if at end
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

  // --- Handlers for Stack Operations ---
  function handlePush() {
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
    engine.push(val);
    currentStepIdx = engine.getTotalSteps() - 1; // Jump to end of push animation
    updateVisualizerState();
    visualizer.addHistoryLog(`PUSH ${val}`, `Added ${val} to top of stack.`);
    valInput.value = '';
  }

  function handlePop() {
    pausePlayback();
    const success = engine.pop();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    if (success) {
      visualizer.addHistoryLog('POP', 'Removed top node from stack.');
    } else {
      visualizer.addHistoryLog('POP (Underflow)', 'Attempted pop on empty stack.');
    }
  }

  function handlePeek() {
    pausePlayback();
    const topVal = engine.peek();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    if (topVal !== null) {
      visualizer.addHistoryLog('PEEK', `Inspected top element: ${topVal}`);
    } else {
      visualizer.addHistoryLog('PEEK (Empty)', 'Stack is empty.');
    }
  }

  function handleIsEmpty() {
    pausePlayback();
    const empty = engine.isEmpty();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    visualizer.addHistoryLog('ISEMPTY', `Result: ${empty ? 'Empty' : 'Not Empty'}`);
  }

  function handleClear() {
    pausePlayback();
    engine.clear();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    visualizer.addHistoryLog('CLEAR', 'Cleared all nodes from stack.');
  }

  function handleRandomPush() {
    const randomVal = Math.floor(Math.random() * 90) + 10;
    valInput.value = randomVal;
    handlePush();
  }

  function handlePresetDemo() {
    pausePlayback();
    engine.reset();
    engine.push(10);
    engine.push(20);
    engine.push(30);
    engine.push(40);
    currentStepIdx = 0;
    updateVisualizerState();
    startPlayback();
    visualizer.addHistoryLog('PRESET DEMO', 'Loaded demo sequence (10, 20, 30, 40).');
  }

  // --- Event Listeners ---
  if (pushBtn) pushBtn.addEventListener('click', handlePush);
  if (popBtn) popBtn.addEventListener('click', handlePop);
  if (peekBtn) peekBtn.addEventListener('click', handlePeek);
  if (isEmptyBtn) isEmptyBtn.addEventListener('click', handleIsEmpty);
  if (clearBtn) clearBtn.addEventListener('click', handleClear);
  if (randomPushBtn) randomPushBtn.addEventListener('click', handleRandomPush);
  if (presetDemoBtn) presetDemoBtn.addEventListener('click', handlePresetDemo);

  if (valInput) {
    valInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handlePush();
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

    const comments = [];
    escaped = escaped.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, (match) => {
      comments.push(match);
      return `___COMMENT_${comments.length - 1}___`;
    });

    const strings = [];
    escaped = escaped.replace(/(".*?"|&lt;[a-zA-Z0-9_.]*?&gt;)/g, (match) => {
      strings.push(match);
      return `___STRING_${strings.length - 1}___`;
    });

    escaped = escaped.replace(/\b(return|if|else|while|for|break|continue)\b/g, '<span class="syn-ctrl">$1</span>');
    escaped = escaped.replace(/\b(class|struct|public|private|protected|using|namespace|typedef|template|typename|delete|new)\b/g, '<span class="syn-kw">$1</span>');
    escaped = escaped.replace(/\b(void|int|float|double|char|bool|long|short)\b/g, '<span class="syn-type">$1</span>');
    escaped = escaped.replace(/\b(nullptr|NULL|true|false)\b/g, '<span class="syn-type">$1</span>');
    escaped = escaped.replace(/(#include|#define|#ifndef|#endif|#ifdef)/g, '<span class="syn-pp">$1</span>');
    escaped = escaped.replace(/\b(cout|cin|endl)\b/g, '<span class="syn-fn">$1</span>');
    escaped = escaped.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, '<span class="syn-fn">$1</span>');
    escaped = escaped.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="syn-type">$1</span>');
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="syn-num">$1</span>');

    escaped = escaped.replace(/___STRING_(\d+)___/g, (_, idx) => `<span class="syn-str">${strings[idx]}</span>`);
    escaped = escaped.replace(/___COMMENT_(\d+)___/g, (_, idx) => `<span class="syn-cm">${comments[idx]}</span>`);

    el.innerHTML = escaped;
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
