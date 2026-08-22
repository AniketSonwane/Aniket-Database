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
  const savedTheme = localStorage.getItem('aniket_theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('aniket_theme', currentTheme);
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
