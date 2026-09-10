/**
 * Main Application Initializer and Controller for Stack ADT Visualizer
 * Developed by Aniket | CS25131
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Instantiate Engine & Visualizer
  const engine = new StackEngine(5);
  const visualizer = new StackVisualizer(engine);

  let playInterval = null;
  let isPlaying = false;
  let playSpeed = 700; // ms

  // Initial render
  visualizer.render();

  // 2. Setup Theme Toggle
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  
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

  // 3. Operation Control Handlers
  const pushValInput = document.getElementById('pushValueInput');
  const pushBtn = document.getElementById('pushBtn');
  const popBtn = document.getElementById('popBtn');
  const peekBtn = document.getElementById('peekBtn');
  const isEmptyBtn = document.getElementById('isEmptyBtn');
  const isFullBtn = document.getElementById('isFullBtn');
  const randomValBtn = document.getElementById('randomValBtn');
  const capacityInput = document.getElementById('capacityInput');
  const createStackBtn = document.getElementById('createStackBtn');

  if (pushBtn) {
    pushBtn.addEventListener('click', () => {
      stopAutoPlay();
      const val = pushValInput ? pushValInput.value : 50;
      engine.push(val);
      visualizer.render();
    });
  }

  if (popBtn) {
    popBtn.addEventListener('click', () => {
      stopAutoPlay();
      engine.pop();
      visualizer.render();
    });
  }

  if (peekBtn) {
    peekBtn.addEventListener('click', () => {
      stopAutoPlay();
      engine.peek();
      visualizer.render();
    });
  }

  if (isEmptyBtn) {
    isEmptyBtn.addEventListener('click', () => {
      stopAutoPlay();
      engine.checkIsEmpty();
      visualizer.render();
    });
  }

  if (isFullBtn) {
    isFullBtn.addEventListener('click', () => {
      stopAutoPlay();
      engine.checkIsFull();
      visualizer.render();
    });
  }

  if (randomValBtn) {
    randomValBtn.addEventListener('click', () => {
      const rand = Math.floor(Math.random() * 90) + 10;
      if (pushValInput) pushValInput.value = rand;
    });
  }

  if (createStackBtn) {
    createStackBtn.addEventListener('click', () => {
      stopAutoPlay();
      const newCap = capacityInput ? capacityInput.value : 5;
      engine.setCapacity(newCap);
      visualizer.render();
    });
  }

  // 4. Stepper & Playback Controls
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const playBtn = document.getElementById('playBtn');
  const resetBtn = document.getElementById('resetBtn');
  const speedSlider = document.getElementById('speedSlider');
  const timelineSlider = document.getElementById('timelineSlider');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoPlay();
      engine.prevStep();
      visualizer.render();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoPlay();
      engine.nextStep();
      visualizer.render();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stopAutoPlay();
      engine.resetStack();
      visualizer.render();
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      playSpeed = Number(e.target.value);
      if (isPlaying) {
        stopAutoPlay();
        startAutoPlay();
      }
    });
  }

  if (timelineSlider) {
    timelineSlider.addEventListener('input', (e) => {
      stopAutoPlay();
      const stepIdx = Number(e.target.value);
      engine.goToStep(stepIdx);
      visualizer.render();
    });
  }

  function startAutoPlay() {
    isPlaying = true;
    if (playBtn) playBtn.innerHTML = '⏸ Pause';
    playInterval = setInterval(() => {
      if (engine.currentStepIndex < engine.steps.length - 1) {
        engine.nextStep();
        visualizer.render();
      } else {
        stopAutoPlay();
      }
    }, playSpeed);
  }

  function stopAutoPlay() {
    isPlaying = false;
    if (playBtn) playBtn.innerHTML = '▶ Play';
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }
});
