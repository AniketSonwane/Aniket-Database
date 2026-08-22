/**
 * Stack Visualizer UI Renderer
 * Developed by Aniket | CS25131
 */

class StackVisualizer {
  constructor(engine) {
    this.engine = engine;
  }

  render(stepSnapshot) {
    const step = stepSnapshot || this.engine.getCurrentStep();
    if (!step) return;

    this.renderVerticalStack(step);
    this.renderArrayRepresentation(step);
    this.renderCodeHighlighting(step);
    this.renderLiveBreakdown(step);
    this.renderVariablesWatcher(step);
    this.renderAlertBanner(step);
    this.renderHistory(step);
    this.renderStatistics(step);
    this.renderFlowchart(step);
    this.renderStepperInfo(step);
  }

  // 1. Vertical Stack Visualization
  renderVerticalStack(step) {
    const frame = document.getElementById('stackVerticalFrame');
    const topPointer = document.getElementById('stackTopPointer');
    if (!frame) return;

    frame.innerHTML = '';
    const MAX = step.MAX;
    const stack = step.stack;
    const topIndex = step.top;

    // Position TOP pointer text
    if (topPointer) {
      if (topIndex === -1) {
        topPointer.innerHTML = `TOP → -1 (EMPTY)`;
        topPointer.style.color = 'var(--text-dim)';
      } else {
        topPointer.innerHTML = `TOP → Index ${topIndex} (Value: ${stack[topIndex]})`;
        topPointer.style.color = '#ec4899';
      }
    }

    // Render slots 0 to MAX-1 (CSS flex-direction: column-reverse places slot 0 at bottom!)
    for (let i = 0; i < MAX; i++) {
      const slot = document.createElement('div');
      slot.className = 'stack-slot';
      
      const isFilled = (i <= topIndex && stack[i] !== undefined && stack[i] !== null);
      const isTopSlot = (i === topIndex);

      if (isFilled) {
        slot.classList.add('filled');
        if (isTopSlot) slot.classList.add('is-top');

        // Apply dynamic animations
        if (i === step.activeElementIndex) {
          if (step.animationState === 'entering') slot.classList.add('entering');
          if (step.animationState === 'leaving') slot.classList.add('leaving');
          if (step.animationState === 'peek_highlight') slot.classList.add('peek-highlight');
        }

        slot.innerHTML = `
          <span>${stack[i]}</span>
          <span class="stack-slot-index">arr[${i}]</span>
        `;
      } else {
        slot.classList.add('empty');
        slot.innerHTML = `
          <span>[ Empty ]</span>
          <span class="stack-slot-index">arr[${i}]</span>
        `;
      }

      frame.appendChild(slot);
    }
  }

  // 2. Horizontal Array Representation
  renderArrayRepresentation(step) {
    const grid = document.getElementById('arrayRepGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const MAX = step.MAX;
    const stack = step.stack;
    const topIndex = step.top;

    for (let i = 0; i < MAX; i++) {
      const cellUnit = document.createElement('div');
      cellUnit.className = 'array-cell-unit';

      const isFilled = (i <= topIndex && stack[i] !== undefined && stack[i] !== null);
      const isTopSlot = (i === topIndex);

      let boxClass = 'array-cell-box';
      if (isFilled) boxClass += ' filled';
      if (isTopSlot) boxClass += ' is-top';

      let pointerHtml = '';
      if (i === 0 && topIndex === 0) {
        pointerHtml = `<span class="array-cell-pointer top-ptr">bot & top</span>`;
      } else if (i === 0) {
        pointerHtml = `<span class="array-cell-pointer bot-ptr">bottom</span>`;
      } else if (i === topIndex) {
        pointerHtml = `<span class="array-cell-pointer top-ptr">top ↑</span>`;
      } else {
        pointerHtml = `<span class="array-cell-pointer"></span>`;
      }

      cellUnit.innerHTML = `
        <div class="array-cell-index">Index ${i}</div>
        <div class="${boxClass}">${isFilled ? stack[i] : ''}</div>
        ${pointerHtml}
      `;

      grid.appendChild(cellUnit);
    }
  }

  // 3. Line-by-Line C++ Code Highlighting
  renderCodeHighlighting(step) {
    const codeBody = document.getElementById('cppCodeBody');
    const codeLines = document.querySelectorAll('#cppCodeBody .code-line');
    codeLines.forEach((line) => {
      const lineNum = Number(line.getAttribute('data-line'));
      if (lineNum === step.cLine) {
        line.classList.add('active');
        // Scroll only inside cppCodeBody overflow container without moving the main webpage
        if (codeBody) {
          const lineTop = line.offsetTop - codeBody.offsetTop;
          const lineBottom = lineTop + line.offsetHeight;
          if (lineTop < codeBody.scrollTop) {
            codeBody.scrollTop = lineTop;
          } else if (lineBottom > codeBody.scrollTop + codeBody.clientHeight) {
            codeBody.scrollTop = lineBottom - codeBody.clientHeight;
          }
        }
      } else {
        line.classList.remove('active');
      }
    });
  }

  // 4. Live Breakdown Card
  renderLiveBreakdown(step) {
    const opVal = document.getElementById('breakdownOp');
    const valVal = document.getElementById('breakdownValue');
    const condVal = document.getElementById('breakdownCondition');
    const actionVal = document.getElementById('breakdownAction');
    const nextVal = document.getElementById('breakdownNext');

    if (opVal) opVal.textContent = step.operation;
    if (valVal) valVal.textContent = step.val !== null ? step.val : 'N/A';
    if (condVal) condVal.textContent = step.conditionResult ? `isFull/isEmpty → ${step.conditionResult}` : 'N/A';
    if (actionVal) actionVal.textContent = step.action || '-';
    if (nextVal) nextVal.textContent = step.nextOp || '-';
  }

  // 5. Variables Watcher
  renderVariablesWatcher(step) {
    const topVar = document.getElementById('varTop');
    const maxVar = document.getElementById('varMax');
    const sizeVar = document.getElementById('varSize');
    const emptyVar = document.getElementById('varIsEmpty');
    const fullVar = document.getElementById('varIsFull');

    if (topVar) topVar.textContent = step.top;
    if (maxVar) maxVar.textContent = step.MAX;
    if (sizeVar) sizeVar.textContent = (step.top + 1) + ' / ' + step.MAX;
    if (emptyVar) emptyVar.textContent = (step.top === -1) ? 'true' : 'false';
    if (fullVar) fullVar.textContent = (step.top === step.MAX - 1) ? 'true' : 'false';
  }

  // 6. Status & Alert Banners
  renderAlertBanner(step) {
    const container = document.getElementById('alertBannerContainer');
    if (!container) return;

    if (step.status === 'error') {
      container.innerHTML = `
        <div class="alert-banner ${step.animationState === 'overflow' ? 'overflow' : 'underflow'}">
          <span>${step.statusMessage}</span>
        </div>
      `;
    } else if (step.status === 'success') {
      container.innerHTML = `
        <div class="alert-banner success">
          <span>${step.statusMessage}</span>
        </div>
      `;
    } else {
      container.innerHTML = '';
    }
  }

  // 7. Operation History
  renderHistory(step) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    historyList.innerHTML = '';
    const historyItems = step.history || [];

    if (historyItems.length === 0) {
      historyList.innerHTML = `<div style="color: var(--text-dim); font-size: 0.8rem;">No operations performed yet.</div>`;
      return;
    }

    historyItems.slice(0, 10).forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      if (item.status === 'overflow' || item.status === 'underflow') {
        div.style.borderLeftColor = 'var(--color-danger)';
      } else if (item.status === 'warning') {
        div.style.borderLeftColor = 'var(--color-warning)';
      }
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          <strong>${item.op}</strong>
          <span style="opacity: 0.7; font-size: 0.75rem;">${item.time}</span>
        </div>
      `;
      historyList.appendChild(div);
    });
  }

  // 8. Statistics Panel
  renderStatistics(step) {
    const capStat = document.getElementById('statCap');
    const sizeStat = document.getElementById('statSize');
    const topStat = document.getElementById('statTop');
    const pushStat = document.getElementById('statPush');
    const popStat = document.getElementById('statPop');
    const peekStat = document.getElementById('statPeek');

    if (capStat) capStat.textContent = step.MAX;
    if (sizeStat) sizeStat.textContent = step.top + 1;
    if (topStat) topStat.textContent = step.top;
    if (pushStat) pushStat.textContent = step.stats.pushCount;
    if (popStat) popStat.textContent = step.stats.popCount;
    if (peekStat) peekStat.textContent = step.stats.peekCount;
  }

  // 9. Interactive Flowchart Branch Highlighting
  renderFlowchart(step) {
    const fcNodes = document.querySelectorAll('.fc-node');
    fcNodes.forEach(node => {
      if (node.id === step.flowchartActiveNode) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });
  }

  // 10. Stepper Controls Info
  renderStepperInfo(step) {
    const text = document.getElementById('stepCounterText');
    const slider = document.getElementById('timelineSlider');
    const total = this.engine.steps.length;
    const current = this.engine.currentStepIndex + 1;

    if (text) text.textContent = `Step: ${current} / ${total}`;
    if (slider) {
      slider.max = total > 0 ? total - 1 : 0;
      slider.value = this.engine.currentStepIndex;
    }
  }
}
