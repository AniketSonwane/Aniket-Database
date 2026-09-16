/**
 * Application Controller & Event Handlers for Infix to Postfix Conversion Visualizer
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new InfixToPostfixEngine();
  const visualizer = new InfixToPostfixVisualizer();

  // DOM Elements - Input
  const infixInput = document.getElementById('infixInput');
  const convertBtn = document.getElementById('convertBtn');
  const resetBtn = document.getElementById('resetBtn');

  // DOM Elements - Controls
  const startBtn = document.getElementById('startBtn');
  const prevBtn = document.getElementById('prevBtn');
  const playBtn = document.getElementById('playBtn');
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('restartBtn');
  const timelineSlider = document.getElementById('timelineSlider');

  // Speed Buttons
  const speedSlowBtn = document.getElementById('speedSlowBtn');
  const speedNormBtn = document.getElementById('speedNormBtn');
  const speedFastBtn = document.getElementById('speedFastBtn');

  // Theme & Code
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const copyCodeBtn = document.getElementById('copyCodeBtn');

  // State
  let currentInfix = 'A+B*(C-D)';
  let currentSteps = [];
  let currentStepIdx = 0;
  let isPlaying = false;
  let playTimer = null;
  let playbackSpeed = 700; // ms

  initTheme();

  // Load default demonstration expression: A+B*(C-D)
  loadExpression('A+B*(C-D)');

  function loadExpression(expr) {
    pausePlayback();
    // Do not allow spaces unless explicitly handled; trim and remove whitespace
    const cleanExpr = expr.replace(/\s+/g, '');
    currentInfix = cleanExpr;
    if (infixInput) infixInput.value = cleanExpr;

    currentSteps = engine.process(cleanExpr);
    visualizer.initializeSession(cleanExpr, currentSteps);
    currentStepIdx = 0;
    updateVisualizerState();
  }

  function updateVisualizerState() {
    const total = currentSteps.length;
    if (currentStepIdx < 0) currentStepIdx = 0;
    if (currentStepIdx >= total) currentStepIdx = total - 1;

    const step = currentSteps[currentStepIdx];
    visualizer.renderStep(step, total, currentInfix);

    if (playBtn) {
      playBtn.textContent = isPlaying ? '❚❚ Pause' : '▶ Auto Play';
      playBtn.className = isPlaying ? 'btn btn-amber' : 'btn btn-primary';
    }

    if (prevBtn) prevBtn.disabled = (currentStepIdx === 0);
    if (nextBtn) nextBtn.disabled = (currentStepIdx === total - 1 || (step && step.isError));
  }

  function stepForward() {
    const total = currentSteps.length;
    const currentStep = currentSteps[currentStepIdx];

    if (currentStep && currentStep.isError) {
      pausePlayback();
      return;
    }

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
    if (currentStepIdx >= currentSteps.length - 1) {
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
    if (isPlaying) pausePlayback();
    else startPlayback();
  }

  // --- Input & Button Events ---

  convertBtn?.addEventListener('click', () => {
    const raw = infixInput?.value || '';
    if (!raw.trim()) {
      alert('Please enter an infix expression.');
      return;
    }
    loadExpression(raw);
  });

  infixInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      convertBtn?.click();
    }
  });

  resetBtn?.addEventListener('click', () => {
    loadExpression('A+B*(C-D)');
  });

  // Preset Chips
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const expr = chip.getAttribute('data-expr');
      if (expr) {
        loadExpression(expr);
      }
    });
  });

  // Controls Navigation
  startBtn?.addEventListener('click', () => {
    pausePlayback();
    currentStepIdx = 0;
    updateVisualizerState();
    startPlayback();
  });

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

  timelineSlider?.addEventListener('input', (e) => {
    pausePlayback();
    currentStepIdx = Number(e.target.value) - 1;
    updateVisualizerState();
  });

  // Speed Selection
  function setSpeed(spd, activeBtn) {
    playbackSpeed = spd;
    [speedSlowBtn, speedNormBtn, speedFastBtn].forEach(b => b?.classList.remove('active'));
    activeBtn?.classList.add('active');
    if (isPlaying) {
      pausePlayback();
      startPlayback();
    }
  }

  speedSlowBtn?.addEventListener('click', () => setSpeed(1200, speedSlowBtn));
  speedNormBtn?.addEventListener('click', () => setSpeed(700, speedNormBtn));
  speedFastBtn?.addEventListener('click', () => setSpeed(300, speedFastBtn));

  // Copy Code Button
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

  // Theme Toggle
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
