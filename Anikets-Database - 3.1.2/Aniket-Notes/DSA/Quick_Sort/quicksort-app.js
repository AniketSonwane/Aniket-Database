/**
 * Application Entry Point & Event Bindings for Quick Sort
 * Default Array: [10, 7, 8, 9, 1, 5]
 */

document.addEventListener('DOMContentLoaded', () => {
  const defaultArray = [10, 7, 8, 9, 1, 5];
  const visualizer = new QuickSortVisualizer();
  visualizer.init(defaultArray);

  // Parse custom array input
  function parseInput() {
    const inputVal = visualizer.arrayInput.value.trim();
    if (!inputVal) return null;

    const parts = inputVal.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const nums = [];

    for (let part of parts) {
      const parsed = Number(part);
      if (isNaN(parsed) || !Number.isInteger(parsed)) {
        return null;
      }
      nums.push(parsed);
    }

    if (nums.length < 2 || nums.length > 12) {
      return null;
    }

    return nums;
  }

  // Handle Apply Input Array
  const applyBtn = document.getElementById('applyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const validArray = parseInput();
      if (validArray) {
        visualizer.inputError.classList.remove('active');
        visualizer.loadArray(validArray);
      } else {
        visualizer.inputError.classList.add('active');
      }
    });
  }

  // Handle Random Array Generator
  const randomBtn = document.getElementById('randomBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const size = Math.floor(Math.random() * 3) + 6; // 6 to 8 elements
      const randomArr = [];
      for (let k = 0; k < size; k++) {
        randomArr.push(Math.floor(Math.random() * 90) + 1);
      }
      visualizer.arrayInput.value = randomArr.join(', ');
      visualizer.inputError.classList.remove('active');
      visualizer.loadArray(randomArr);
    });
  }

  // Handle Reset Input
  const resetInputBtn = document.getElementById('resetInputBtn');
  if (resetInputBtn) {
    resetInputBtn.addEventListener('click', () => {
      visualizer.arrayInput.value = defaultArray.join(', ');
      visualizer.inputError.classList.remove('active');
      visualizer.loadArray(defaultArray);
    });
  }

  // Handle Try Another Array in Result Modal
  const tryAnotherBtn = document.getElementById('tryAnotherBtn');
  if (tryAnotherBtn) {
    tryAnotherBtn.addEventListener('click', () => {
      visualizer.arrayInput.value = defaultArray.join(', ');
      visualizer.loadArray(defaultArray);
      visualizer.arrayInput.focus();
    });
  }

  // Theme Toggle Button
  if (visualizer.themeToggleBtn) {
    visualizer.themeToggleBtn.addEventListener('click', () => {
      visualizer.toggleTheme();
    });
  }

  // Controls Event Listeners
  if (visualizer.playBtn) {
    visualizer.playBtn.addEventListener('click', () => visualizer.togglePlay());
  }

  if (visualizer.prevBtn) {
    visualizer.prevBtn.addEventListener('click', () => visualizer.prevStep());
  }

  if (visualizer.nextBtn) {
    visualizer.nextBtn.addEventListener('click', () => visualizer.nextStep());
  }

  if (visualizer.restartBtn) {
    visualizer.restartBtn.addEventListener('click', () => visualizer.restart());
  }

  if (visualizer.speedSlider) {
    visualizer.speedSlider.addEventListener('input', (e) => {
      visualizer.setSpeed(parseInt(e.target.value, 10));
    });
  }

  if (visualizer.timelineSlider) {
    visualizer.timelineSlider.addEventListener('input', (e) => {
      visualizer.seekToStep(parseInt(e.target.value, 10));
    });
  }

  // Keyboard Shortcuts (Space for Play/Pause, Left/Right for Step Nav)
  document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      visualizer.togglePlay();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      visualizer.nextStep();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      visualizer.prevStep();
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      visualizer.restart();
    }
  });
});
