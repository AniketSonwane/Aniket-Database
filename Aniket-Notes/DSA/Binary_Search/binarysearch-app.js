/**
 * Application Entry Point & Event Bindings for Binary Search
 * Default Array: [10, 20, 30, 40, 50, 60, 70], Default Target: 50
 */

document.addEventListener('DOMContentLoaded', () => {
  const defaultArray = [10, 20, 30, 40, 50, 60, 70];
  const defaultTarget = 50;
  const visualizer = new BinarySearchVisualizer();
  visualizer.init(defaultArray, defaultTarget);

  // Parse custom array and target input
  function parseInput() {
    const inputVal = visualizer.arrayInput.value.trim();
    const targetVal = visualizer.targetInput.value.trim();

    if (!inputVal || targetVal === '') return null;

    const parts = inputVal.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const nums = [];

    for (let part of parts) {
      const parsed = Number(part);
      if (isNaN(parsed) || !Number.isInteger(parsed)) {
        return null;
      }
      nums.push(parsed);
    }

    const parsedTarget = Number(targetVal);
    if (isNaN(parsedTarget) || !Number.isInteger(parsedTarget)) {
      return null;
    }

    if (nums.length < 2 || nums.length > 12) {
      return null;
    }

    return { array: nums, target: parsedTarget };
  }

  // Handle Search / Visualize Button
  const applyBtn = document.getElementById('applyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const validData = parseInput();
      if (validData) {
        visualizer.inputError.classList.remove('active');
        visualizer.loadArray(validData.array, validData.target);
      } else {
        visualizer.inputError.classList.add('active');
      }
    });
  }

  // Handle Sort Array First Button in Warning Banner
  const sortArrayBtn = document.getElementById('sortArrayBtn');
  if (sortArrayBtn) {
    sortArrayBtn.addEventListener('click', () => {
      const validData = parseInput();
      const currentArr = validData ? validData.array : defaultArray;
      const target = validData ? validData.target : defaultTarget;

      const sorted = [...currentArr].sort((a, b) => a - b);
      visualizer.arrayInput.value = sorted.join(', ');
      visualizer.inputError.classList.remove('active');
      visualizer.loadArray(sorted, target);
    });
  }

  // Handle Random Sorted Array Generator
  const randomBtn = document.getElementById('randomBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const size = Math.floor(Math.random() * 4) + 6; // 6 to 9 elements
      const randomSet = new Set();
      while (randomSet.size < size) {
        randomSet.add(Math.floor(Math.random() * 90) + 5);
      }
      const randomArr = Array.from(randomSet).sort((a, b) => a - b);
      const randomTarget = randomArr[Math.floor(Math.random() * randomArr.length)];

      visualizer.arrayInput.value = randomArr.join(', ');
      visualizer.targetInput.value = randomTarget;
      visualizer.inputError.classList.remove('active');
      visualizer.loadArray(randomArr, randomTarget);
    });
  }

  // Handle Random Target Button
  const randomTargetBtn = document.getElementById('randomTargetBtn');
  if (randomTargetBtn) {
    randomTargetBtn.addEventListener('click', () => {
      const validData = parseInput();
      const currentArray = validData ? validData.array : defaultArray;
      
      // 70% chance of selecting an existing target, 30% chance of missing target
      let target;
      if (Math.random() < 0.7) {
        target = currentArray[Math.floor(Math.random() * currentArray.length)];
      } else {
        target = Math.floor(Math.random() * 90) + 5;
      }

      visualizer.targetInput.value = target;
      visualizer.inputError.classList.remove('active');
      visualizer.loadArray(currentArray, target);
    });
  }

  // Handle Reset Input
  const resetInputBtn = document.getElementById('resetInputBtn');
  if (resetInputBtn) {
    resetInputBtn.addEventListener('click', () => {
      visualizer.arrayInput.value = defaultArray.join(', ');
      visualizer.targetInput.value = defaultTarget;
      visualizer.inputError.classList.remove('active');
      visualizer.loadArray(defaultArray, defaultTarget);
    });
  }

  // Handle Try Another Search in Result Modal
  const tryAnotherBtn = document.getElementById('tryAnotherBtn');
  if (tryAnotherBtn) {
    tryAnotherBtn.addEventListener('click', () => {
      visualizer.arrayInput.value = defaultArray.join(', ');
      visualizer.targetInput.value = defaultTarget;
      visualizer.loadArray(defaultArray, defaultTarget);
      visualizer.targetInput.focus();
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
