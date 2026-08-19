/**
 * Application Entry Point & Event Controller for Bubble Sort Visualizer
 */

document.addEventListener('DOMContentLoaded', () => {
  const visualizer = new BubbleSortVisualizer();
  const defaultArray = [5, 1, 4, 2, 8];

  // DOM Elements
  const arrayInput = document.getElementById('arrayInput');
  const inputError = document.getElementById('inputError');
  const applyBtn = document.getElementById('applyBtn');
  const randomBtn = document.getElementById('randomBtn');
  const resetInputBtn = document.getElementById('resetInputBtn');

  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('restartBtn');
  const speedSlider = document.getElementById('speedSlider');
  const timelineSlider = document.getElementById('timelineSlider');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const tryAnotherBtn = document.getElementById('tryAnotherBtn');

  // Initialize visualizer
  visualizer.init(defaultArray);

  // Helper: Parse & validate array input
  function parseInput(rawString) {
    if (!rawString || typeof rawString !== 'string') return null;
    
    const parts = rawString.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (parts.length < 2 || parts.length > 12) return null;

    const nums = [];
    for (const part of parts) {
      const parsed = Number(part);
      if (isNaN(parsed) || !Number.isInteger(parsed) || Math.abs(parsed) > 9999) {
        return null;
      }
      nums.push(parsed);
    }
    return nums;
  }

  function handleApplyArray() {
    const parsed = parseInput(arrayInput.value);
    if (!parsed) {
      inputError.classList.add('active');
      return;
    }
    inputError.classList.remove('active');
    visualizer.loadArray(parsed);
  }

  function handleRandomArray() {
    const len = Math.floor(Math.random() * 4) + 5; // 5 to 8 elements
    const randomNums = [];
    for (let i = 0; i < len; i++) {
      const sign = Math.random() < 0.2 ? -1 : 1;
      randomNums.push(sign * (Math.floor(Math.random() * 50) + 1));
    }
    arrayInput.value = randomNums.join(', ');
    inputError.classList.remove('active');
    visualizer.loadArray(randomNums);
  }

  function handleReset() {
    arrayInput.value = defaultArray.join(', ');
    inputError.classList.remove('active');
    visualizer.loadArray(defaultArray);
  }

  // Event Listeners
  applyBtn.addEventListener('click', handleApplyArray);
  randomBtn.addEventListener('click', handleRandomArray);
  resetInputBtn.addEventListener('click', handleReset);

  playBtn.addEventListener('click', () => {
    visualizer.togglePlay();
  });

  prevBtn.addEventListener('click', () => {
    visualizer.prevStep();
  });

  nextBtn.addEventListener('click', () => {
    visualizer.nextStep();
  });

  restartBtn.addEventListener('click', () => {
    visualizer.restart();
  });

  speedSlider.addEventListener('input', (e) => {
    visualizer.setSpeed(Number(e.target.value));
  });

  timelineSlider.addEventListener('input', (e) => {
    visualizer.seekToStep(Number(e.target.value));
  });

  themeToggleBtn.addEventListener('click', () => {
    visualizer.toggleTheme();
  });

  if (tryAnotherBtn) {
    tryAnotherBtn.addEventListener('click', () => {
      arrayInput.scrollIntoView({ behavior: 'smooth' });
      arrayInput.focus();
    });
  }

  // Enter key in array input
  arrayInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleApplyArray();
    }
  });

  // Keyboard Navigation: Space bar (Play/Pause), Left/Right Arrows
  document.addEventListener('keydown', (e) => {
    if (document.activeElement === arrayInput) return;

    if (e.code === 'Space') {
      e.preventDefault();
      visualizer.togglePlay();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      visualizer.prevStep();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      visualizer.nextStep();
    }
  });
});
