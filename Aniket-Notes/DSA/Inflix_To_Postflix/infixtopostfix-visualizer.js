/**
 * Infix to Postfix Visualizer Component
 * Handles dynamic DOM updates, animations, LIFO stack rendering,
 * expression ribbon tracking, C++ code sync, and dry-run table highlighting.
 */

class InfixToPostfixVisualizer {
  constructor() {
    this.dom = {
      // Input & warning
      infixInput: document.getElementById('infixInput'),
      inputError: document.getElementById('inputError'),

      // Controls
      prevBtn: document.getElementById('prevBtn'),
      playBtn: document.getElementById('playBtn'),
      nextBtn: document.getElementById('nextBtn'),
      restartBtn: document.getElementById('restartBtn'),
      convertAllBtn: document.getElementById('convertAllBtn'),
      stepCounterText: document.getElementById('stepCounterText'),
      timelineSlider: document.getElementById('timelineSlider'),
      speedSlider: document.getElementById('speedSlider'),

      // Expression ribbon
      expressionTape: document.getElementById('expressionTape'),
      currentTokenBadge: document.getElementById('currentTokenBadge'),
      currentTypeBadge: document.getElementById('currentTypeBadge'),
      currentPrecBadge: document.getElementById('currentPrecBadge'),
      currentAssocBadge: document.getElementById('currentAssocBadge'),

      // Vertical Stack
      stackVerticalFrame: document.getElementById('stackVerticalFrame'),
      stackTopPointer: document.getElementById('stackTopPointer'),

      // Operator Comparator Card
      comparatorCard: document.getElementById('comparatorCard'),
      compIncomingOp: document.getElementById('compIncomingOp'),
      compIncomingPrec: document.getElementById('compIncomingPrec'),
      compStackTopOp: document.getElementById('compStackTopOp'),
      compStackTopPrec: document.getElementById('compStackTopPrec'),
      compConditionText: document.getElementById('compConditionText'),

      // Postfix Output
      postfixTape: document.getElementById('postfixTape'),
      postfixStringVal: document.getElementById('postfixStringVal'),

      // Live Action Breakdown
      breakdownPhase: document.getElementById('breakdownPhase'),
      breakdownAction: document.getElementById('breakdownAction'),
      breakdownReason: document.getElementById('breakdownReason'),

      // Stats
      statProcessed: document.getElementById('statProcessed'),
      statPushes: document.getElementById('statPushes'),
      statPops: document.getElementById('statPops'),
      statOperands: document.getElementById('statOperands'),
      statStackDepth: document.getElementById('statStackDepth'),

      // Table & Code
      dryRunTableBody: document.getElementById('dryRunTableBody'),
      cppCodeBody: document.getElementById('cppCodeBody')
    };
  }

  /**
   * Renders the initial expression ribbon
   */
  renderExpressionTape(cleanExpr, currentTokenIndex) {
    if (!this.dom.expressionTape) return;
    this.dom.expressionTape.innerHTML = '';

    for (let i = 0; i < cleanExpr.length; i++) {
      const char = cleanExpr[i];
      const charSpan = document.createElement('div');
      charSpan.className = 'token-chip';
      charSpan.textContent = char;

      if (currentTokenIndex === -1) {
        charSpan.classList.add('state-upcoming');
      } else if (i < currentTokenIndex) {
        charSpan.classList.add('state-processed');
      } else if (i === currentTokenIndex) {
        charSpan.classList.add('state-current');
      } else {
        charSpan.classList.add('state-upcoming');
      }

      this.dom.expressionTape.appendChild(charSpan);
    }
  }

  /**
   * Renders the vertical LIFO stack elements
   */
  renderStack(stack) {
    if (!this.dom.stackVerticalFrame) return;
    this.dom.stackVerticalFrame.innerHTML = '';

    if (!stack || stack.length === 0) {
      if (this.dom.stackTopPointer) {
        this.dom.stackTopPointer.innerHTML = `<span>TOP →</span> <strong style="color: var(--text-dim);">(Stack is Empty)</strong>`;
      }
      this.dom.stackVerticalFrame.innerHTML = `
        <div class="stack-empty-placeholder">
          <span>EMPTY STACK</span>
          <span style="font-size:0.75rem; opacity:0.6;">No operators pending</span>
        </div>
      `;
      return;
    }

    const topIdx = stack.length - 1;
    if (this.dom.stackTopPointer) {
      this.dom.stackTopPointer.innerHTML = `<span>TOP →</span> <strong style="color: #ec4899;">Index ${topIdx} ('${stack[topIdx]}')</strong>`;
    }

    // Render from top (MAX) down to 0 for realistic vertical visualization
    for (let i = stack.length - 1; i >= 0; i--) {
      const isTop = i === stack.length - 1;
      const slot = document.createElement('div');
      slot.className = `stack-slot ${isTop ? 'slot-top-active' : ''}`;
      slot.innerHTML = `
        <span class="slot-index">[${i}]</span>
        <span class="slot-val">${stack[i]}</span>
        ${isTop ? '<span class="slot-top-tag">TOP</span>' : ''}
      `;
      this.dom.stackVerticalFrame.appendChild(slot);
    }
  }

  /**
   * Renders the postfix output tape & formatted string
   */
  renderPostfix(postfixStr, newlyAddedChar = null) {
    if (this.dom.postfixStringVal) {
      this.dom.postfixStringVal.textContent = postfixStr ? postfixStr : '(Empty)';
    }

    if (!this.dom.postfixTape) return;
    this.dom.postfixTape.innerHTML = '';

    if (!postfixStr || postfixStr.length === 0) {
      this.dom.postfixTape.innerHTML = `<span style="color: var(--text-dim); font-size: 0.85rem; font-style: italic;">No postfix tokens generated yet...</span>`;
      return;
    }

    for (let i = 0; i < postfixStr.length; i++) {
      const ch = postfixStr[i];
      const chip = document.createElement('div');
      const isLatest = i === postfixStr.length - 1;
      chip.className = `postfix-chip ${isLatest ? 'chip-latest' : ''}`;
      chip.textContent = ch;
      this.dom.postfixTape.appendChild(chip);
    }
  }

  /**
   * Updates the Operator Comparator card
   */
  renderComparator(comparing) {
    if (!this.dom.comparatorCard) return;

    if (!comparing) {
      this.dom.comparatorCard.style.display = 'none';
      return;
    }

    this.dom.comparatorCard.style.display = 'block';
    if (this.dom.compIncomingOp) this.dom.compIncomingOp.textContent = `'${comparing.incomingOp}'`;
    if (this.dom.compIncomingPrec) this.dom.compIncomingPrec.textContent = comparing.incomingPrec;
    if (this.dom.compStackTopOp) this.dom.compStackTopOp.textContent = `'${comparing.stackTopOp}'`;
    if (this.dom.compStackTopPrec) this.dom.compStackTopPrec.textContent = comparing.stackTopPrec;
    
    if (this.dom.compConditionText) {
      this.dom.compConditionText.innerHTML = `
        <span style="color: ${comparing.conditionMet ? '#f59e0b' : '#10b981'}; font-weight:700;">
          ${comparing.ruleText} ➔ ${comparing.conditionMet ? 'POP TOP OPERATOR' : 'PUSH CURRENT OPERATOR'}
        </span>
      `;
    }
  }

  /**
   * Populates the Static / Dynamic Dry Run Table
   */
  buildDryRunTable(tableData) {
    if (!this.dom.dryRunTableBody) return;
    this.dom.dryRunTableBody.innerHTML = '';

    if (!tableData || tableData.length === 0) {
      this.dom.dryRunTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-slate-500">No conversion steps available.</td></tr>`;
      return;
    }

    tableData.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.id = `tableRow_${idx}`;
      tr.className = 'table-row-item transition-colors';
      tr.innerHTML = `
        <td class="font-mono text-center font-bold text-slate-400">${row.stepNum}</td>
        <td class="font-mono text-center font-bold text-indigo-400"><code>${row.symbol}</code></td>
        <td><span class="type-tag type-${row.type.toLowerCase().replace(/\s+/g, '-')}">${row.type}</span></td>
        <td class="font-semibold text-slate-200">${row.action}</td>
        <td class="text-xs text-slate-400">${row.reason}</td>
        <td class="font-mono text-xs font-bold text-pink-400">${row.stackState}</td>
        <td class="font-mono text-xs font-bold text-emerald-400">${row.postfixState}</td>
      `;
      this.dom.dryRunTableBody.appendChild(tr);
    });
  }

  /**
   * Highlights the active row in the table (without auto-scrolling the page)
   */
  highlightTableRow(tokenIndex, token) {
    if (!this.dom.dryRunTableBody) return;
    const allRows = this.dom.dryRunTableBody.querySelectorAll('tr');
    allRows.forEach(r => r.classList.remove('table-row-active'));

    // Highlight row matching current step if found
    for (let r of allRows) {
      const symbolCell = r.querySelector('td:nth-child(2)');
      if (symbolCell && symbolCell.textContent.trim() === token) {
        r.classList.add('table-row-active');
        break;
      }
    }
  }

  /**
   * Highlights the C++ Code Line (without auto-scrolling the page)
   */
  highlightCppLine(lineNum) {
    if (!this.dom.cppCodeBody) return;
    const lines = this.dom.cppCodeBody.querySelectorAll('.code-line');
    lines.forEach(line => {
      const num = parseInt(line.getAttribute('data-line'), 10);
      if (num === lineNum) {
        line.classList.add('code-line-active');
        // Only scroll the internal code body container if necessary, never the whole page window
        const containerTop = this.dom.cppCodeBody.scrollTop;
        const containerHeight = this.dom.cppCodeBody.clientHeight;
        const lineTop = line.offsetTop - this.dom.cppCodeBody.offsetTop;
        if (lineTop < containerTop || lineTop > containerTop + containerHeight - 30) {
          this.dom.cppCodeBody.scrollTop = Math.max(0, lineTop - 60);
        }
      } else {
        line.classList.remove('code-line-active');
      }
    });
  }

  /**
   * Master render method for a single simulation step
   */
  renderStep(step, cleanExpr, totalSteps) {
    if (!step) return;

    // 1. Controls & Step Info
    if (this.dom.stepCounterText) {
      this.dom.stepCounterText.textContent = `Step: ${step.stepIndex + 1} / ${totalSteps}`;
    }
    if (this.dom.timelineSlider) {
      this.dom.timelineSlider.value = step.stepIndex;
    }

    // 2. Expression Ribbon & Token Inspector
    this.renderExpressionTape(cleanExpr, step.tokenIndex);

    if (this.dom.currentTokenBadge) {
      this.dom.currentTokenBadge.textContent = step.token ? `'${step.token}'` : 'N/A';
    }
    if (this.dom.currentTypeBadge) {
      this.dom.currentTypeBadge.textContent = step.tokenType;
    }
    if (this.dom.currentPrecBadge) {
      const prec = step.token === '^' ? '3' : ('*/%'.includes(step.token) ? '2' : ('+-'.includes(step.token) ? '1' : '0'));
      this.dom.currentPrecBadge.textContent = step.tokenType === 'OPERATOR' ? `Level ${prec}` : 'N/A';
    }
    if (this.dom.currentAssocBadge) {
      this.dom.currentAssocBadge.textContent = step.token === '^' ? 'Right ➔ Left' : (step.tokenType === 'OPERATOR' ? 'Left ➔ Right' : 'N/A');
    }

    // 3. Vertical Stack
    this.renderStack(step.stack);

    // 4. Operator Comparator Card
    this.renderComparator(step.comparing);

    // 5. Postfix Tape
    this.renderPostfix(step.postfix, step.token);

    // 6. Action Breakdown
    if (this.dom.breakdownPhase) this.dom.breakdownPhase.textContent = step.phase.replace(/_/g, ' ');
    if (this.dom.breakdownAction) this.dom.breakdownAction.textContent = step.action;
    if (this.dom.breakdownReason) this.dom.breakdownReason.textContent = step.reason;

    // 7. Statistics
    if (this.dom.statProcessed) this.dom.statProcessed.textContent = step.stats.charsProcessed;
    if (this.dom.statPushes) this.dom.statPushes.textContent = step.stats.pushes;
    if (this.dom.statPops) this.dom.statPops.textContent = step.stats.pops;
    if (this.dom.statOperands) this.dom.statOperands.textContent = step.stats.operandsCount;
    if (this.dom.statStackDepth) this.dom.statStackDepth.textContent = step.stats.stackDepth;

    // 8. C++ Code Debugger
    this.highlightCppLine(step.cLine);

    // 9. Table Active Row
    this.highlightTableRow(step.tokenIndex, step.token);
  }

  showError(msg) {
    if (!this.dom.inputError) return;
    if (msg) {
      this.dom.inputError.textContent = msg;
      this.dom.inputError.style.display = 'block';
    } else {
      this.dom.inputError.style.display = 'none';
    }
  }
}
