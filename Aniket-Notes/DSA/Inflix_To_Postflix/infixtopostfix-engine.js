/**
 * Infix to Postfix Conversion Simulation Engine
 * Simulates the classic Shunting-Yard Stack algorithm step-by-step
 * with line-by-line mapping to standard C++ implementation.
 */

class InfixToPostfixEngine {
  constructor(rawExpression) {
    this.rawExpression = rawExpression || "";
    this.cleanExpression = this.sanitize(rawExpression);
    this.steps = [];
    this.dryRunTable = [];
    this.validation = this.validate(this.cleanExpression);
    
    if (this.validation.isValid) {
      this.generateSteps();
    }
  }

  sanitize(expr) {
    if (!expr) return "";
    return expr.replace(/\s+/g, "");
  }

  validate(expr) {
    if (!expr || expr.length === 0) {
      return { isValid: false, error: "Please enter an infix expression." };
    }

    // Check for valid characters: alphanumeric, +, -, *, /, %, ^, (, )
    const validCharRegex = /^[A-Za-z0-9+\-*/%^()]+$/;
    if (!validCharRegex.test(expr)) {
      return { isValid: false, error: "Expression contains invalid characters. Use letters, numbers, and valid operators (+, -, *, /, %, ^, (, ))." };
    }

    // Check bracket matching balance
    let parenCount = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '(') parenCount++;
      if (ch === ')') parenCount--;
      if (parenCount < 0) {
        return { isValid: false, error: `Invalid expression — unmatched closing bracket ')' at position ${i + 1}.` };
      }
    }
    if (parenCount > 0) {
      return { isValid: false, error: "Invalid expression — unmatched opening bracket '(' without closing bracket." };
    }

    // Check consecutive binary operators like ++, **, */ (allow only single operators between operands)
    const isOp = (c) => "+-*/%^".includes(c);
    for (let i = 0; i < expr.length - 1; i++) {
      if (isOp(expr[i]) && isOp(expr[i + 1])) {
        return { isValid: false, error: `Invalid operator placement: consecutive operators '${expr[i]}${expr[i + 1]}' at position ${i + 1}.` };
      }
    }

    // Starts or ends with invalid operator (excluding parens)
    if (isOp(expr[0])) {
      return { isValid: false, error: `Expression cannot start with operator '${expr[0]}'.` };
    }
    if (isOp(expr[expr.length - 1])) {
      return { isValid: false, error: `Expression cannot end with operator '${expr[expr.length - 1]}'.` };
    }

    return { isValid: true, error: null };
  }

  getPrecedence(op) {
    switch (op) {
      case '^':
        return 3;
      case '*':
      case '/':
      case '%':
        return 2;
      case '+':
      case '-':
        return 1;
      case '(':
      case ')':
        return 0;
      default:
        return -1;
    }
  }

  getAssociativity(op) {
    if (op === '^') return 'R'; // Right-to-Left (e.g., 2^3^2 = 2^(3^2))
    return 'L'; // Left-to-Right
  }

  isOperand(ch) {
    return /^[A-Za-z0-9]$/.test(ch);
  }

  isOperator(ch) {
    return ['+', '-', '*', '/', '%', '^'].includes(ch);
  }

  recordStep(data) {
    const step = {
      stepIndex: this.steps.length,
      token: data.token || '',
      tokenIndex: data.tokenIndex !== undefined ? data.tokenIndex : -1,
      tokenType: data.tokenType || 'UNKNOWN',
      cLine: data.cLine || 1,
      stack: [...data.stack],
      postfix: data.postfix,
      action: data.action,
      reason: data.reason,
      comparing: data.comparing || null,
      phase: data.phase || 'PROCESSING',
      stats: {
        charsProcessed: data.stats.charsProcessed,
        pushes: data.stats.pushes,
        pops: data.stats.pops,
        operandsCount: data.stats.operandsCount,
        operatorsCount: data.stats.operatorsCount,
        stackDepth: data.stack.length
      }
    };
    this.steps.push(step);
  }

  generateSteps() {
    const expr = this.cleanExpression;
    const stack = [];
    let postfix = "";
    
    let charsProcessed = 0;
    let pushes = 0;
    let pops = 0;
    let operandsCount = 0;
    let operatorsCount = 0;

    const currentStats = () => ({
      charsProcessed,
      pushes,
      pops,
      operandsCount,
      operatorsCount
    });

    // Step 0: Initial State before processing
    this.recordStep({
      token: '',
      tokenIndex: -1,
      tokenType: 'START',
      cLine: 9, // string postfix = ""; stack<char> s;
      stack: stack,
      postfix: postfix,
      action: "Initialize Stack and Postfix Output",
      reason: `Ready to scan infix expression "${expr}". Stack is empty and output string is blank.`,
      comparing: null,
      phase: 'INITIALIZATION',
      stats: currentStats()
    });

    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      charsProcessed++;

      // CASE 1: OPERAND
      if (this.isOperand(ch)) {
        operandsCount++;
        postfix += ch;

        this.recordStep({
          token: ch,
          tokenIndex: i,
          tokenType: 'OPERAND',
          cLine: 13, // postfix += ch;
          stack: stack,
          postfix: postfix,
          action: `Append '${ch}' to Postfix`,
          reason: `'${ch}' is an operand. According to conversion rules, operands are directly added to the postfix expression without entering the Stack.`,
          comparing: null,
          phase: 'OPERAND_HANDLING',
          stats: currentStats()
        });

        this.dryRunTable.push({
          stepNum: this.dryRunTable.length + 1,
          symbol: ch,
          type: 'Operand',
          action: `Add '${ch}' to output`,
          reason: 'Operands go straight to postfix',
          stackState: stack.length > 0 ? stack.join(' ') : '(Empty)',
          postfixState: postfix
        });
      }
      // CASE 2: OPENING BRACKET '('
      else if (ch === '(') {
        stack.push(ch);
        pushes++;

        this.recordStep({
          token: ch,
          tokenIndex: i,
          tokenType: 'OPEN_PAREN',
          cLine: 18, // s.push(ch);
          stack: stack,
          postfix: postfix,
          action: `Push '(' onto Stack`,
          reason: `'(' marks the beginning of a sub-expression. It is pushed onto the stack to act as a barrier boundary until its matching ')' is encountered.`,
          comparing: null,
          phase: 'PAREN_HANDLING',
          stats: currentStats()
        });

        this.dryRunTable.push({
          stepNum: this.dryRunTable.length + 1,
          symbol: ch,
          type: 'Opening Bracket',
          action: "Push '(' to stack",
          reason: 'Acts as sub-expression boundary',
          stackState: stack.join(' '),
          postfixState: postfix
        });
      }
      // CASE 3: CLOSING BRACKET ')'
      else if (ch === ')') {
        this.recordStep({
          token: ch,
          tokenIndex: i,
          tokenType: 'CLOSE_PAREN',
          cLine: 22, // while(!s.empty() && s.top() != '(')
          stack: stack,
          postfix: postfix,
          action: `Encountered ')' — Begin popping sub-expression`,
          reason: `')' indicates the end of a bracketed sub-expression. We must pop and append all operators from the stack to output until matching '(' is found.`,
          comparing: null,
          phase: 'PAREN_HANDLING',
          stats: currentStats()
        });

        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          const popped = stack.pop();
          pops++;
          postfix += popped;

          this.recordStep({
            token: ch,
            tokenIndex: i,
            tokenType: 'CLOSE_PAREN',
            cLine: 25, // postfix += s.top(); s.pop();
            stack: stack,
            postfix: postfix,
            action: `Pop '${popped}' from Stack to Postfix`,
            reason: `Operator '${popped}' belongs inside the parentheses. Adding it to postfix output as bracket closes.`,
            comparing: null,
            phase: 'PAREN_HANDLING',
            stats: currentStats()
          });

          this.dryRunTable.push({
            stepNum: this.dryRunTable.length + 1,
            symbol: ch,
            type: 'Closing Bracket',
            action: `Pop '${popped}' to output`,
            reason: `Unloading operators enclosed by parentheses`,
            stackState: stack.length > 0 ? stack.join(' ') : '(Empty)',
            postfixState: postfix
          });
        }

        // Pop the opening '('
        if (stack.length > 0 && stack[stack.length - 1] === '(') {
          stack.pop();
          pops++;

          this.recordStep({
            token: ch,
            tokenIndex: i,
            tokenType: 'CLOSE_PAREN',
            cLine: 28, // s.pop(); // discard '('
            stack: stack,
            postfix: postfix,
            action: `Discard matching '(' from Stack`,
            reason: `Matching opening bracket '(' reached and removed from stack. Parentheses do not appear in postfix expressions.`,
            comparing: null,
            phase: 'PAREN_HANDLING',
            stats: currentStats()
          });

          this.dryRunTable.push({
            stepNum: this.dryRunTable.length + 1,
            symbol: ch,
            type: 'Closing Bracket',
            action: "Discard '(' from stack",
            reason: 'Parentheses are removed and not in postfix',
            stackState: stack.length > 0 ? stack.join(' ') : '(Empty)',
            postfixState: postfix
          });
        }
      }
      // CASE 4: OPERATOR (+, -, *, /, %, ^)
      else if (this.isOperator(ch)) {
        operatorsCount++;
        const currPrec = this.getPrecedence(ch);
        const currAssoc = this.getAssociativity(ch);

        // While stack is not empty, top != '(', and precedence rule requires pop
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          const topOp = stack[stack.length - 1];
          const topPrec = this.getPrecedence(topOp);

          // Pop condition:
          // Left-associative: topPrec >= currPrec
          // Right-associative: topPrec > currPrec
          const shouldPop = currAssoc === 'L' ? (topPrec >= currPrec) : (topPrec > currPrec);

          const comparingInfo = {
            incomingOp: ch,
            incomingPrec: currPrec,
            incomingAssoc: currAssoc,
            stackTopOp: topOp,
            stackTopPrec: topPrec,
            conditionMet: shouldPop,
            ruleText: currAssoc === 'L'
              ? `Precedence('${topOp}') [${topPrec}] >= Precedence('${ch}') [${currPrec}]`
              : `Right-Associative: Precedence('${topOp}') [${topPrec}] > Precedence('${ch}') [${currPrec}]`
          };

          if (shouldPop) {
            const popped = stack.pop();
            pops++;
            postfix += popped;

            this.recordStep({
              token: ch,
              tokenIndex: i,
              tokenType: 'OPERATOR',
              cLine: 34, // postfix += s.top(); s.pop();
              stack: stack,
              postfix: postfix,
              action: `Pop '${popped}' from Stack to Postfix`,
              reason: `Stack top '${popped}' (precedence ${topPrec}) has >= priority over incoming '${ch}' (precedence ${currPrec}). Stack operator must execute first.`,
              comparing: comparingInfo,
              phase: 'OPERATOR_HANDLING',
              stats: currentStats()
            });

            this.dryRunTable.push({
              stepNum: this.dryRunTable.length + 1,
              symbol: ch,
              type: 'Operator',
              action: `Pop '${popped}' to output`,
              reason: `Stack top '${topOp}' has >= precedence than '${ch}'`,
              stackState: stack.length > 0 ? stack.join(' ') : '(Empty)',
              postfixState: postfix
            });
          } else {
            // Precedence of incoming operator is higher; stop popping
            this.recordStep({
              token: ch,
              tokenIndex: i,
              tokenType: 'OPERATOR',
              cLine: 32, // while check false
              stack: stack,
              postfix: postfix,
              action: `Compare Precedence: '${ch}' > Stack Top '${topOp}'`,
              reason: `Incoming '${ch}' (precedence ${currPrec}) has strictly higher precedence than stack top '${topOp}' (precedence ${topPrec}). No more popping needed.`,
              comparing: comparingInfo,
              phase: 'OPERATOR_HANDLING',
              stats: currentStats()
            });
            break;
          }
        }

        // Push incoming operator
        stack.push(ch);
        pushes++;

        this.recordStep({
          token: ch,
          tokenIndex: i,
          tokenType: 'OPERATOR',
          cLine: 37, // s.push(ch);
          stack: stack,
          postfix: postfix,
          action: `Push '${ch}' onto Stack`,
          reason: `Pushed '${ch}' onto stack. It will wait until subsequent higher-precedence operators or brackets finish.`,
          comparing: null,
          phase: 'OPERATOR_HANDLING',
          stats: currentStats()
        });

        this.dryRunTable.push({
          stepNum: this.dryRunTable.length + 1,
          symbol: ch,
          type: 'Operator',
          action: `Push '${ch}' to stack`,
          reason: `Waits for lower/equal precedence or end of expression`,
          stackState: stack.join(' '),
          postfixState: postfix
        });
      }
    }

    // FINAL STEP: Pop all remaining operators from the Stack
    this.recordStep({
      token: 'END',
      tokenIndex: expr.length,
      tokenType: 'END',
      cLine: 42, // while(!s.empty())
      stack: stack,
      postfix: postfix,
      action: "End of Expression Reached — Drain Stack",
      reason: "All characters in the infix expression have been scanned. Pop and append all remaining operators from the Stack to Postfix.",
      comparing: null,
      phase: 'FINAL_DRAIN',
      stats: currentStats()
    });

    while (stack.length > 0) {
      const popped = stack.pop();
      pops++;
      postfix += popped;

      this.recordStep({
        token: 'END',
        tokenIndex: expr.length,
        tokenType: 'FINAL_POP',
        cLine: 44, // postfix += s.top(); s.pop();
        stack: stack,
        postfix: postfix,
        action: `Pop remaining '${popped}' from Stack to Postfix`,
        reason: `Popping remaining operator '${popped}' from the top of the stack into postfix output.`,
        comparing: null,
        phase: 'FINAL_DRAIN',
        stats: currentStats()
      });

      this.dryRunTable.push({
        stepNum: this.dryRunTable.length + 1,
        symbol: 'END',
        type: 'End of Input',
        action: `Pop remaining '${popped}'`,
        reason: 'Emptying stack at end of conversion',
        stackState: stack.length > 0 ? stack.join(' ') : '(Empty)',
        postfixState: postfix
      });
    }

    // COMPLETE STEP
    this.recordStep({
      token: 'DONE',
      tokenIndex: expr.length,
      tokenType: 'COMPLETE',
      cLine: 48, // return postfix;
      stack: [],
      postfix: postfix,
      action: "Conversion Completed Successfully 🎉",
      reason: `Final Postfix Expression is: "${postfix}". The expression is now in Reverse Polish Notation (RPN) ready for linear $O(N)$ stack evaluation!`,
      comparing: null,
      phase: 'COMPLETE',
      stats: currentStats()
    });
  }

  getStepsCount() {
    return this.steps.length;
  }

  getStep(index) {
    if (index < 0) return this.steps[0];
    if (index >= this.steps.length) return this.steps[this.steps.length - 1];
    return this.steps[index];
  }
}
