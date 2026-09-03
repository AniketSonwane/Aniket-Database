/**
 * Infix to Postfix Application Controller
 * Handles user interactions, animation timer loops, preset expressions,
 * quiz interactions, copy code buttons, and theme toggling.
 */

class InfixToPostfixApp {
  constructor() {
    this.engine = null;
    this.visualizer = new InfixToPostfixVisualizer();
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.playSpeed = 700;

    this.init();
  }

  init() {
    this.bindEvents();
    this.initTheme();
    this.loadExpression("A+B*C"); // Default starting expression
  }

  loadExpression(expr) {
    if (this.isPlaying) this.pause();

    const inputElem = document.getElementById('infixInput');
    if (inputElem) inputElem.value = expr;

    this.engine = new InfixToPostfixEngine(expr);

    if (!this.engine.validation.isValid) {
      this.visualizer.showError(this.engine.validation.error);
      return;
    }

    this.visualizer.showError(null);
    this.currentStepIndex = 0;

    // Configure timeline slider
    const maxSteps = Math.max(0, this.engine.getStepsCount() - 1);
    if (this.visualizer.dom.timelineSlider) {
      this.visualizer.dom.timelineSlider.max = maxSteps;
      this.visualizer.dom.timelineSlider.value = 0;
    }

    // Build Static / Dynamic Dry Run Table
    this.visualizer.buildDryRunTable(this.engine.dryRunTable);

    // Render Step 0
    this.updateCurrentStep();
  }

  updateCurrentStep() {
    if (!this.engine || !this.engine.validation.isValid) return;

    const step = this.engine.getStep(this.currentStepIndex);
    this.visualizer.renderStep(
      step,
      this.engine.cleanExpression,
      this.engine.getStepsCount()
    );

    // Update navigation buttons enabled/disabled states
    const totalSteps = this.engine.getStepsCount();
    if (this.visualizer.dom.prevBtn) {
      this.visualizer.dom.prevBtn.disabled = this.currentStepIndex <= 0;
    }
    if (this.visualizer.dom.nextBtn) {
      this.visualizer.dom.nextBtn.disabled = this.currentStepIndex >= totalSteps - 1;
    }
  }

  nextStep() {
    if (!this.engine) return;
    if (this.currentStepIndex < this.engine.getStepsCount() - 1) {
      this.currentStepIndex++;
      this.updateCurrentStep();
    } else {
      this.pause();
    }
  }

  prevStep() {
    if (!this.engine) return;
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.updateCurrentStep();
    }
  }

  play() {
    if (!this.engine || !this.engine.validation.isValid) return;
    if (this.currentStepIndex >= this.engine.getStepsCount() - 1) {
      this.currentStepIndex = 0; // restart if at the end
    }

    this.isPlaying = true;
    if (this.visualizer.dom.playBtn) {
      this.visualizer.dom.playBtn.innerHTML = `<span>⏸ Pause</span>`;
      this.visualizer.dom.playBtn.classList.add('btn-playing');
    }

    this.playTimer = setInterval(() => {
      if (this.currentStepIndex < this.engine.getStepsCount() - 1) {
        this.nextStep();
      } else {
        this.pause();
      }
    }, this.playSpeed);
  }

  pause() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
    if (this.visualizer.dom.playBtn) {
      this.visualizer.dom.playBtn.innerHTML = `<span>▶ Play</span>`;
      this.visualizer.dom.playBtn.classList.remove('btn-playing');
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  reset() {
    this.pause();
    this.currentStepIndex = 0;
    this.updateCurrentStep();
  }

  convertAll() {
    this.pause();
    if (!this.engine) return;
    this.currentStepIndex = this.engine.getStepsCount() - 1;
    this.updateCurrentStep();
  }

  bindEvents() {
    // Convert button & Enter Key
    const applyBtn = document.getElementById('applyBtn');
    const infixInput = document.getElementById('infixInput');

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        if (infixInput) this.loadExpression(infixInput.value);
      });
    }

    if (infixInput) {
      infixInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.loadExpression(infixInput.value);
        }
      });
    }

    // Preset pills
    const presetPills = document.querySelectorAll('.preset-pill');
    presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const expr = pill.getAttribute('data-expr');
        if (expr) {
          presetPills.forEach(p => p.classList.remove('active-preset'));
          pill.classList.add('active-preset');
          this.loadExpression(expr);
        }
      });
    });

    // Stepper Controls
    if (this.visualizer.dom.prevBtn) {
      this.visualizer.dom.prevBtn.addEventListener('click', () => {
        this.pause();
        this.prevStep();
      });
    }

    if (this.visualizer.dom.nextBtn) {
      this.visualizer.dom.nextBtn.addEventListener('click', () => {
        this.pause();
        this.nextStep();
      });
    }

    if (this.visualizer.dom.playBtn) {
      this.visualizer.dom.playBtn.addEventListener('click', () => {
        this.togglePlay();
      });
    }

    if (this.visualizer.dom.restartBtn) {
      this.visualizer.dom.restartBtn.addEventListener('click', () => {
        this.reset();
      });
    }

    if (this.visualizer.dom.convertAllBtn) {
      this.visualizer.dom.convertAllBtn.addEventListener('click', () => {
        this.convertAll();
      });
    }

    // Timeline Slider Scrubber
    if (this.visualizer.dom.timelineSlider) {
      this.visualizer.dom.timelineSlider.addEventListener('input', (e) => {
        this.pause();
        this.currentStepIndex = parseInt(e.target.value, 10);
        this.updateCurrentStep();
      });
    }

    // Speed Slider
    if (this.visualizer.dom.speedSlider) {
      this.visualizer.dom.speedSlider.addEventListener('input', (e) => {
        this.playSpeed = parseInt(e.target.value, 10);
        if (this.isPlaying) {
          this.pause();
          this.play();
        }
      });
    }

    // Keyboard navigation shortcuts
    window.addEventListener('keydown', (e) => {
      // Ignore if user is actively typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === 'ArrowRight') {
        this.pause();
        this.nextStep();
      } else if (e.key === 'ArrowLeft') {
        this.pause();
        this.prevStep();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.key.toLowerCase() === 'r') {
        this.reset();
      }
    });

    // Copy C++ Code
    const copyCppBtn = document.getElementById('copyCppBtn');
    if (copyCppBtn) {
      copyCppBtn.addEventListener('click', () => {
        const cppCode = document.getElementById('rawCppCode');
        if (cppCode) {
          navigator.clipboard.writeText(cppCode.innerText).then(() => {
            this.showToast("C++ Code copied to clipboard! 📋");
          }).catch(() => {
            this.showToast("Failed to copy code.");
          });
        }
      });
    }

    // Theme Toggle Button
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Interactive Quiz Setup
    this.initQuiz();
  }

  showToast(msg) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.className = 'toast-banner';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('toast-show');
    setTimeout(() => {
      toast.classList.remove('toast-show');
    }, 2600);
  }

  initTheme() {
    const savedTheme = localStorage.getItem('aniket_theme') || localStorage.getItem('theme') || 'dark';
    this.applyTheme(savedTheme);
  }

  applyTheme(theme) {
    const isLight = theme === 'light';
    document.documentElement.classList.toggle('light', isLight);
    document.documentElement.classList.toggle('light-mode', isLight);
    document.documentElement.classList.toggle('dark', !isLight);
    document.documentElement.classList.toggle('dark-mode', !isLight);

    if (document.body) {
      document.body.classList.toggle('light', isLight);
      document.body.classList.toggle('light-mode', isLight);
      document.body.classList.toggle('dark', !isLight);
      document.body.classList.toggle('dark-mode', !isLight);
    }

    localStorage.setItem('aniket_theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    const isCurrentlyLight = document.body.classList.contains('light-mode') || document.body.classList.contains('light');
    const newTheme = isCurrentlyLight ? 'dark' : 'light';
    this.applyTheme(newTheme);
    this.showToast(`Switched to ${newTheme} mode`);
  }

  initQuiz() {
    const quizForm = document.getElementById('quizForm');
    const submitQuizBtn = document.getElementById('submitQuizBtn');
    const quizScoreResult = document.getElementById('quizScoreResult');

    if (!submitQuizBtn || !quizForm) return;

    const answers = {
      q1: 'b', // Operators wait until higher precedence finishes
      q2: 'c', // Top operators popped into postfix
      q3: 'd', // AB+C*
      q4: 'a'  // O(N)
    };

    submitQuizBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let score = 0;
      let total = 4;

      for (let q in answers) {
        const selected = quizForm.querySelector(`input[name="${q}"]:checked`);
        const feedback = document.getElementById(`${q}_feedback`);
        if (selected && selected.value === answers[q]) {
          score++;
          if (feedback) {
            feedback.innerHTML = `<span class="text-emerald-400 font-bold">✔ Correct!</span>`;
            feedback.className = 'quiz-feedback feedback-correct';
          }
        } else {
          if (feedback) {
            feedback.innerHTML = `<span class="text-rose-400 font-bold">✖ Incorrect. Correct answer is (${answers[q].toUpperCase()}).</span>`;
            feedback.className = 'quiz-feedback feedback-wrong';
          }
        }
      }

      if (quizScoreResult) {
        quizScoreResult.innerHTML = `
          <div class="quiz-score-badge">
            Your Score: <strong>${score} / ${total}</strong> (${Math.round((score / total) * 100)}%)
          </div>
        `;
      }
    });
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.infixApp = new InfixToPostfixApp();
});
