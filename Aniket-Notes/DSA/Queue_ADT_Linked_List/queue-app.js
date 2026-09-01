/**
 * Application Entry Point & Event Controller for Queue ADT (Linked List) Visualizer
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new QueueEngine();
  const visualizer = new QueueVisualizer();

  // DOM Elements
  const valInput = document.getElementById('valInput');
  const inputError = document.getElementById('inputError');

  const enqueueBtn = document.getElementById('enqueueBtn');
  const dequeueBtn = document.getElementById('dequeueBtn');
  const peekBtn = document.getElementById('peekBtn');
  const isEmptyBtn = document.getElementById('isEmptyBtn');
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
    engine.enqueue(val);
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    visualizer.addHistoryLog(`ENQUEUE ${val}`, `Added ${val} to REAR of queue.`);
    valInput.value = '';
  }

  function handleDequeue() {
    pausePlayback();
    const success = engine.dequeue();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();

    if (success) {
      visualizer.addHistoryLog('DEQUEUE', 'Removed node from FRONT of queue.');
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
      visualizer.addHistoryLog('PEEK', `Inspected FRONT node: ${frontVal}`);
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

  function handleClear() {
    pausePlayback();
    engine.clear();
    currentStepIdx = engine.getTotalSteps() - 1;
    updateVisualizerState();
    visualizer.addHistoryLog('CLEAR', 'Cleared all nodes from queue.');
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
