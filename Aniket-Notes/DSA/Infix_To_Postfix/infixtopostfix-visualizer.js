/**
 * Infix to Postfix DOM Renderer & Visualizer
 * Renders Expression Ribbon, Visual Vertical Stack, Postfix Token Boxes,
 * Precedence Highlights, Synchronized C++ Code, and Step-by-Step Table.
 */

class InfixToPostfixVisualizer {
  constructor() {
    this.exprTapeRow = document.getElementById('exprTapeRow');
    this.stackBracketVessel = document.getElementById('stackBracketVessel');
    this.postfixBoxesRow = document.getElementById('postfixBoxesRow');
    this.stepsTableBody = document.getElementById('stepsTableBody');
    this.stepExpText = document.getElementById('stepExpText');
    this.invalidAlertBanner = document.getElementById('invalidAlertBanner');
    this.invalidAlertText = document.getElementById('invalidAlertText');

    // Variable State Badges
    this.varInfixVal = document.getElementById('varInfixVal');
    this.varStackVal = document.getElementById('varStackVal');
    this.varPostfixVal = document.getElementById('varPostfixVal');
    this.varOperandVal = document.getElementById('varOperandVal');

    // Precedence Items
    this.precExp = document.getElementById('precExp');
    this.precMulDiv = document.getElementById('precMulDiv');
    this.precAddSub = document.getElementById('precAddSub');

    // Playback & Table
    this.stepCounterText = document.getElementById('stepCounterText');
    this.timelineSlider = document.getElementById('timelineSlider');
    this.codeLinesContainer = document.getElementById('cppCodeLines');

    // C++ Snippet matching user's exact logic
    this.cppSnippet = [
      { line: 1, text: '#include <iostream>' },
      { line: 2, text: '#include <stack>' },
      { line: 3, text: '#include <cctype>' },
      { line: 4, text: 'using namespace std;' },
      { line: 5, text: '' },
      { line: 6, text: 'class InfixToPostfix {' },
      { line: 7, text: 'public:' },
      { line: 8, text: '    int priority(char ch) {' },
      { line: 9, text: '        if (ch == \'^\') return 3;' },
      { line: 10, text: '        if (ch == \'*\' || ch == \'/\') return 2;' },
      { line: 11, text: '        if (ch == \'+\' || ch == \'-\') return 1;' },
      { line: 12, text: '        return 0;' },
      { line: 13, text: '    }' },
      { line: 14, text: '' },
      { line: 15, text: '    bool isOperator(char ch) {' },
      { line: 16, text: '        return ch == \'+\' || ch == \'-\' ||' },
      { line: 17, text: '               ch == \'*\' || ch == \'/\' || ch == \'^\';' },
      { line: 18, text: '    }' },
      { line: 19, text: '' },
      { line: 20, text: '    string convert(string infix) {' },
      { line: 21, text: '        stack<char> s;' },
      { line: 22, text: '        string postfix = "";' },
      { line: 23, text: '        bool operand = false;' },
      { line: 24, text: '' },
      { line: 25, text: '        for (char ch : infix) {' },
      { line: 26, text: '' },
      { line: 27, text: '            if (isalnum(ch)) {' },
      { line: 28, text: '                if (operand) return "Invalid Expression";' },
      { line: 29, text: '' },
      { line: 30, text: '                postfix += ch;' },
      { line: 31, text: '                operand = true;' },
      { line: 32, text: '            }' },
      { line: 33, text: '' },
      { line: 34, text: '            else if (ch == \'(\') {' },
      { line: 35, text: '                if (operand) return "Invalid Expression";' },
      { line: 36, text: '' },
      { line: 37, text: '                s.push(ch);' },
      { line: 38, text: '            }' },
      { line: 39, text: '' },
      { line: 40, text: '            else if (ch == \')\') {' },
      { line: 41, text: '                if (!operand) return "Invalid Expression";' },
      { line: 42, text: '' },
      { line: 43, text: '                while (!s.empty() && s.top() != \'(\') {' },
      { line: 44, text: '                    postfix += s.top();' },
      { line: 45, text: '                    s.pop();' },
      { line: 46, text: '                }' },
      { line: 47, text: '' },
      { line: 48, text: '                if (s.empty()) return "Invalid Expression";' },
      { line: 49, text: '' },
      { line: 50, text: '                s.pop();' },
      { line: 51, text: '                operand = true;' },
      { line: 52, text: '            }' },
      { line: 53, text: '' },
      { line: 54, text: '            else if (isOperator(ch)) {' },
      { line: 55, text: '                if (!operand) return "Invalid Expression";' },
      { line: 56, text: '' },
      { line: 57, text: '                while (!s.empty() && s.top() != \'(\' &&' },
      { line: 58, text: '                       priority(s.top()) >= priority(ch)) {' },
      { line: 59, text: '                    postfix += s.top();' },
      { line: 60, text: '                    s.pop();' },
      { line: 61, text: '                }' },
      { line: 62, text: '' },
      { line: 63, text: '                s.push(ch);' },
      { line: 64, text: '                operand = false;' },
      { line: 65, text: '            }' },
      { line: 66, text: '' },
      { line: 67, text: '            else {' },
      { line: 68, text: '                return "Invalid Expression";' },
      { line: 69, text: '            }' },
      { line: 70, text: '        }' },
      { line: 71, text: '' },
      { line: 72, text: '        if (!operand) return "Invalid Expression";' },
      { line: 73, text: '' },
      { line: 74, text: '        while (!s.empty()) {' },
      { line: 75, text: '            if (s.top() == \'(\') return "Invalid Expression";' },
      { line: 76, text: '' },
      { line: 77, text: '            postfix += s.top();' },
      { line: 78, text: '            s.pop();' },
      { line: 79, text: '        }' },
      { line: 80, text: '' },
      { line: 81, text: '        return postfix;' },
      { line: 82, text: '    }' },
      { line: 83, text: '};' }
    ];

    this.renderCppCode();
  }

  renderCppCode() {
    if (!this.codeLinesContainer) return;
    this.codeLinesContainer.innerHTML = '';

    this.cppSnippet.forEach(item => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'code-line';
      lineDiv.id = `cpp-line-${item.line}`;

      const lineNumSpan = document.createElement('span');
      lineNumSpan.className = 'line-num';
      lineNumSpan.textContent = item.line;

      const lineCodeSpan = document.createElement('span');
      lineCodeSpan.className = 'line-code';
      lineCodeSpan.textContent = item.text;

      lineDiv.appendChild(lineNumSpan);
      lineDiv.appendChild(lineCodeSpan);
      this.codeLinesContainer.appendChild(lineDiv);
    });
  }

  highlightCodeLine(lineNum) {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active-highlight'));
    if (lineNum) {
      const activeEl = document.getElementById(`cpp-line-${lineNum}`);
      if (activeEl) {
        activeEl.classList.add('active-highlight');
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  /**
   * Initializes the static table rows and expression ribbon for a given run
   */
  initializeSession(infix, allSteps) {
    // 1. Build Expression Ribbon
    if (this.exprTapeRow) {
      this.exprTapeRow.innerHTML = '';
      for (let i = 0; i < infix.length; i++) {
        const box = document.createElement('div');
        box.className = 'expr-char-box';
        box.id = `expr-char-${i}`;
        box.innerHTML = `
          <span class="char-glyph">${infix[i]}</span>
          <span class="char-idx">[${i}]</span>
        `;
        this.exprTapeRow.appendChild(box);
      }
    }

    // 2. Build Steps Table
    if (this.stepsTableBody) {
      this.stepsTableBody.innerHTML = '';
      allSteps.forEach((st, idx) => {
        const tr = document.createElement('tr');
        tr.id = `table-row-${idx}`;
        if (st.isError) tr.className = 'error-row';

        const stackStr = st.stackSnapshot.length > 0 ? st.stackSnapshot.join(' ') : '—';
        const postfixStr = st.postfixSnapshot ? st.postfixSnapshot : '—';
        const charStr = st.charIndex !== -1 ? st.character : 'End';

        tr.innerHTML = `
          <td>${st.stepNumber}</td>
          <td style="font-weight: 700; color: #38bdf8;">${charStr}</td>
          <td>${st.action}</td>
          <td style="color: #c084fc;">${stackStr}</td>
          <td style="color: #10b981; font-weight: 700;">${postfixStr}</td>
        `;
        this.stepsTableBody.appendChild(tr);
      });
    }
  }

  renderStep(step, totalSteps, infix) {
    if (!step) return;

    // 1. Counter & Slider
    if (this.stepCounterText) {
      this.stepCounterText.textContent = `Step: ${step.stepNumber} / ${totalSteps}`;
    }
    if (this.timelineSlider) {
      this.timelineSlider.max = totalSteps;
      this.timelineSlider.value = step.stepNumber;
    }

    // 2. Code Highlight
    this.highlightCodeLine(step.codeLine);

    // 3. Step Explanation
    if (this.stepExpText) {
      this.stepExpText.textContent = step.explanation;
    }

    // 4. Expression Tape Highlighting
    document.querySelectorAll('.expr-char-box').forEach((box, i) => {
      box.classList.remove('active', 'processed', 'error');
      const arrow = box.querySelector('.char-pointer-arrow');
      if (arrow) arrow.remove();

      if (step.charIndex !== -1) {
        if (i < step.charIndex) {
          box.classList.add('processed');
        } else if (i === step.charIndex) {
          if (step.isError) {
            box.classList.add('error');
          } else {
            box.classList.add('active');
            const pointer = document.createElement('span');
            pointer.className = 'char-pointer-arrow';
            pointer.textContent = '▼';
            box.appendChild(pointer);
          }
        }
      } else if (step.isComplete || step.charType === 'end') {
        box.classList.add('processed');
      }
    });

    // 5. Live Variables State Bar
    if (this.varInfixVal) this.varInfixVal.textContent = infix || '""';
    if (this.varStackVal) {
      const topElem = step.stackSnapshot.length > 0 ? step.stackSnapshot[step.stackSnapshot.length - 1] : 'None';
      this.varStackVal.textContent = `${step.stackSnapshot.length} (Top: ${topElem})`;
    }
    if (this.varPostfixVal) {
      this.varPostfixVal.textContent = step.postfixSnapshot ? `"${step.postfixSnapshot}"` : '""';
    }
    if (this.varOperandVal) {
      this.varOperandVal.textContent = step.operandFlag ? 'true (Expect Op)' : 'false (Expect Rand)';
      this.varOperandVal.style.color = step.operandFlag ? '#10b981' : '#fbbf24';
    }

    // 6. Visual Stack Rendering
    this.renderStack(step.stackSnapshot, step.pushedChar, step.poppedChar);

    // 7. Postfix Boxes Rendering
    this.renderPostfixBoxes(step.postfixSnapshot, step.newlyAddedPostfixChar);

    // 8. Precedence Comparison Highlights
    this.renderPrecedenceHighlights(step.comparedOps);

    // 9. Table Active Row Highlighting
    document.querySelectorAll('#stepsTableBody tr').forEach((tr, idx) => {
      if (idx === step.stepNumber - 1) {
        tr.classList.add('active-row');
        tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        tr.classList.remove('active-row');
      }
    });

    // 10. Error Alert Banner
    if (this.invalidAlertBanner) {
      if (step.isError) {
        this.invalidAlertBanner.style.display = 'flex';
        if (this.invalidAlertText) {
          this.invalidAlertText.innerHTML = `<strong>Invalid Expression:</strong> ${step.explanation}`;
        }
      } else {
        this.invalidAlertBanner.style.display = 'none';
      }
    }
  }

  renderStack(stackSnapshot = [], pushedChar, poppedChar) {
    if (!this.stackBracketVessel) return;
    this.stackBracketVessel.innerHTML = '';

    if (stackSnapshot.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'stack-empty-msg';
      emptyMsg.textContent = '[ Stack Empty ]';
      this.stackBracketVessel.appendChild(emptyMsg);
      return;
    }

    stackSnapshot.forEach((char, idx) => {
      const box = document.createElement('div');
      const isTop = (idx === stackSnapshot.length - 1);
      box.className = `stack-box-item ${isTop ? 'top-item' : ''}`;

      let badgeHtml = isTop ? '<span class="stack-top-badge">TOP</span>' : '';
      box.innerHTML = `
        <span>${char}</span>
        ${badgeHtml}
      `;
      this.stackBracketVessel.appendChild(box);
    });
  }

  renderPostfixBoxes(postfixStr = '', newlyAddedChar) {
    if (!this.postfixBoxesRow) return;
    this.postfixBoxesRow.innerHTML = '';

    if (!postfixStr || postfixStr.length === 0) {
      const emptySpan = document.createElement('span');
      emptySpan.className = 'text-xs text-dim italic';
      emptySpan.textContent = '[ Postfix output empty ]';
      this.postfixBoxesRow.appendChild(emptySpan);
      return;
    }

    const isOperatorChar = (ch) => ['+', '-', '*', '/', '^'].includes(ch);

    for (let i = 0; i < postfixStr.length; i++) {
      const ch = postfixStr[i];
      const box = document.createElement('div');
      const isOp = isOperatorChar(ch);
      box.className = `postfix-box ${isOp ? 'operator-token' : ''}`;
      if (i === postfixStr.length - 1 && ch === newlyAddedChar) {
        box.classList.add('recent-added');
      }
      box.textContent = ch;
      this.postfixBoxesRow.appendChild(box);
    }
  }

  renderPrecedenceHighlights(comparedOps) {
    [this.precExp, this.precMulDiv, this.precAddSub].forEach(el => {
      el?.classList.remove('highlight-compare');
    });

    if (!comparedOps) return;

    const highlightByOp = (op) => {
      if (op === '^') this.precExp?.classList.add('highlight-compare');
      else if (op === '*' || op === '/') this.precMulDiv?.classList.add('highlight-compare');
      else if (op === '+' || op === '-') this.precAddSub?.classList.add('highlight-compare');
    };

    if (comparedOps.top) highlightByOp(comparedOps.top);
    if (comparedOps.incoming) highlightByOp(comparedOps.incoming);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InfixToPostfixVisualizer;
}
