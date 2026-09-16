/**
 * Infix to Postfix Conversion Engine & Step Snapshot Generator
 * Implements the exact C++ InfixToPostfix class logic,
 * precedence hierarchy, operand grammar flag, and syntax validation.
 */

class InfixToPostfixEngine {
  constructor() {
    this.infix = '';
    this.steps = [];
    this.isValid = true;
    this.errorMessage = '';
    this.errorCharIndex = -1;
    this.finalPostfix = '';

    // C++ Line Mappings matching exact 83-line user code
    this.cppLines = {
      CLASS_HEADER: 6,
      PRIORITY_FN: 8,
      IS_OPERATOR_FN: 15,
      CONVERT_START: 20,
      LOOP_START: 25,
      
      OPERAND_CHECK_INVALID: 28, // if (operand) return "Invalid Expression";
      OPERAND_APPEND: 30,        // postfix += ch; operand = true;
      
      OPEN_PAREN_INVALID: 35,    // if (operand) return "Invalid Expression";
      OPEN_PAREN_PUSH: 37,       // s.push(ch);
      
      CLOSE_PAREN_INVALID: 41,   // if (!operand) return "Invalid Expression";
      CLOSE_PAREN_POP_LOOP: 43,  // while (!s.empty() && s.top() != '(') { postfix += s.top(); s.pop(); }
      CLOSE_PAREN_UNMATCHED: 48, // if (s.empty()) return "Invalid Expression";
      CLOSE_PAREN_DISCARD: 50,   // s.pop(); operand = true;
      
      OPERATOR_INVALID: 55,      // if (!operand) return "Invalid Expression";
      OPERATOR_PREC_LOOP: 57,    // while (!s.empty() && s.top() != '(' && priority(s.top()) >= priority(ch)) ...
      OPERATOR_PUSH: 63,         // s.push(ch); operand = false;
      
      UNKNOWN_CHAR_INVALID: 68,  // else return "Invalid Expression";
      
      END_OPERAND_INVALID: 72,   // if (!operand) return "Invalid Expression";
      END_UNWIND_UNMATCHED: 75,  // if (s.top() == '(') return "Invalid Expression";
      END_UNWIND_POP: 77,        // postfix += s.top(); s.pop();
      CONVERT_RETURN: 81         // return postfix;
    };
  }

  priority(ch) {
    if (ch === '^') return 3;
    if (ch === '*' || ch === '/') return 2;
    if (ch === '+' || ch === '-') return 1;
    return 0;
  }

  isOperator(ch) {
    return ch === '+' || ch === '-' ||
           ch === '*' || ch === '/' || ch === '^';
  }

  isAlphanumeric(ch) {
    return /^[a-zA-Z0-9]$/.test(ch);
  }

  /**
   * Main parsing method that executes the conversion step-by-step
   * and builds a complete snapshot history.
   */
  process(infix) {
    this.infix = infix;
    this.steps = [];
    this.isValid = true;
    this.errorMessage = '';
    this.errorCharIndex = -1;
    this.finalPostfix = '';

    const s = []; // Array used as LIFO stack
    let postfix = '';
    let operand = false;

    // Helper to record a snapshot step
    const recordStep = (config) => {
      const stepObj = {
        stepNumber: this.steps.length + 1,
        charIndex: config.charIndex !== undefined ? config.charIndex : -1,
        character: config.character !== undefined ? config.character : '',
        charType: config.charType || 'none', // 'operand', 'operator', 'open_paren', 'close_paren', 'end', 'none'
        action: config.action || '',
        stackSnapshot: [...s],
        postfixSnapshot: postfix,
        operandFlag: operand,
        codeLine: config.codeLine || this.cppLines.CONVERT_START,
        explanation: config.explanation || '',
        isError: !!config.isError,
        isComplete: !!config.isComplete,
        pushedChar: config.pushedChar || null,
        poppedChar: config.poppedChar || null,
        comparedOps: config.comparedOps || null,
        newlyAddedPostfixChar: config.newlyAddedPostfixChar || null
      };
      this.steps.push(stepObj);
      return stepObj;
    };

    // Step 0: Initialize
    recordStep({
      action: 'Initialize',
      codeLine: this.cppLines.CONVERT_START,
      explanation: `Initialized empty stack s, empty postfix string "", and operand flag = false.`
    });

    if (!infix || infix.length === 0) {
      this.isValid = false;
      this.errorMessage = 'Expression is empty.';
      recordStep({
        isError: true,
        action: 'Invalid: Empty Input',
        codeLine: this.cppLines.END_OPERAND_INVALID,
        explanation: 'Invalid Expression! The input expression contains no characters.'
      });
      return this.steps;
    }

    // Process character by character
    for (let i = 0; i < infix.length; i++) {
      const ch = infix[i];

      if (this.isAlphanumeric(ch)) {
        if (operand) {
          this.isValid = false;
          this.errorCharIndex = i;
          this.errorMessage = `Unexpected operand '${ch}' immediately following another operand without an operator.`;
          recordStep({
            charIndex: i,
            character: ch,
            charType: 'operand',
            isError: true,
            action: 'Invalid Expression: Consecutive Operands',
            codeLine: this.cppLines.OPERAND_CHECK_INVALID,
            explanation: `Invalid Expression! Found operand '${ch}' at index ${i}, but operand flag is already true. Consecutive operands like "${infix[i - 1]}${ch}" without an operator are grammatically invalid.`
          });
          return this.steps;
        }

        postfix += ch;
        operand = true;

        recordStep({
          charIndex: i,
          character: ch,
          charType: 'operand',
          action: `Add Operand '${ch}'`,
          newlyAddedPostfixChar: ch,
          codeLine: this.cppLines.OPERAND_APPEND,
          explanation: `'${ch}' is an alphanumeric operand. Appended directly to postfix output. operand flag set to true (now expecting an operator or ')').`
        });
      }

      else if (ch === '(') {
        if (operand) {
          this.isValid = false;
          this.errorCharIndex = i;
          this.errorMessage = `Missing operator before opening parenthesis '(' at index ${i}.`;
          recordStep({
            charIndex: i,
            character: ch,
            charType: 'open_paren',
            isError: true,
            action: "Invalid Expression: Missing Operator before '('",
            codeLine: this.cppLines.OPEN_PAREN_INVALID,
            explanation: `Invalid Expression! Found '(' immediately after operand '${infix[i - 1]}'. Implicit multiplication like "${infix[i - 1]}(" is not allowed; an explicit operator like '*' is required.`
          });
          return this.steps;
        }

        s.push(ch);
        operand = false;

        recordStep({
          charIndex: i,
          character: ch,
          charType: 'open_paren',
          pushedChar: ch,
          action: "Push '(' to Stack",
          codeLine: this.cppLines.OPEN_PAREN_PUSH,
          explanation: `'(' marks the start of a parenthesized sub-expression. Pushed onto the stack. operand flag set to false (now expecting an operand inside parentheses).`
        });
      }

      else if (ch === ')') {
        if (!operand) {
          this.isValid = false;
          this.errorCharIndex = i;
          this.errorMessage = `Unexpected closing parenthesis ')' at index ${i}. An operand was expected before ')'.`;
          recordStep({
            charIndex: i,
            character: ch,
            charType: 'close_paren',
            isError: true,
            action: "Invalid Expression: Unexpected ')'",
            codeLine: this.cppLines.CLOSE_PAREN_INVALID,
            explanation: `Invalid Expression! Found ')' at index ${i}, but operand flag is false. Empty parentheses "()" or trailing operators before ')' (e.g. "+)") are illegal.`
          });
          return this.steps;
        }

        // Pop from stack until '('
        while (s.length > 0 && s[s.length - 1] !== '(') {
          const popped = s.pop();
          postfix += popped;

          recordStep({
            charIndex: i,
            character: ch,
            charType: 'close_paren',
            poppedChar: popped,
            newlyAddedPostfixChar: popped,
            action: `Pop '${popped}' to Postfix`,
            codeLine: this.cppLines.CLOSE_PAREN_POP_LOOP,
            explanation: `Encountered ')'. Popped operator '${popped}' from stack and appended it to postfix output.`
          });
        }

        if (s.length === 0) {
          this.isValid = false;
          this.errorCharIndex = i;
          this.errorMessage = `Mismatched closing parenthesis ')' at index ${i} with no matching '('.`;
          recordStep({
            charIndex: i,
            character: ch,
            charType: 'close_paren',
            isError: true,
            action: "Invalid Expression: Unmatched ')'",
            codeLine: this.cppLines.CLOSE_PAREN_UNMATCHED,
            explanation: `Invalid Expression! Encountered ')' at index ${i}, but the stack became empty without finding a matching '(' opening parenthesis.`
          });
          return this.steps;
        }

        // Pop and discard the '('
        const openParen = s.pop();
        operand = true;

        recordStep({
          charIndex: i,
          character: ch,
          charType: 'close_paren',
          poppedChar: openParen,
          action: "Pop & Discard '('",
          codeLine: this.cppLines.CLOSE_PAREN_DISCARD,
          explanation: `Matching '(' popped from stack and discarded. The parenthesized sub-expression is now fully resolved. operand flag set to true.`
        });
      }

      else if (this.isOperator(ch)) {
        if (!operand) {
          this.isValid = false;
          this.errorCharIndex = i;
          this.errorMessage = `Unexpected operator '${ch}' at index ${i}. An operand was expected.`;
          recordStep({
            charIndex: i,
            character: ch,
            charType: 'operator',
            isError: true,
            action: `Invalid Expression: Unexpected Operator '${ch}'`,
            codeLine: this.cppLines.OPERATOR_INVALID,
            explanation: `Invalid Expression! Found operator '${ch}' at index ${i}, but operand flag is false. Leading operators (e.g. "+A") or consecutive operators (e.g. "A++B") are illegal.`
          });
          return this.steps;
        }

        const incomingPriority = this.priority(ch);

        // While top of stack has >= priority and is not '('
        while (s.length > 0 && s[s.length - 1] !== '(' && this.priority(s[s.length - 1]) >= incomingPriority) {
          const topOp = s[s.length - 1];
          const topPriority = this.priority(topOp);
          const popped = s.pop();
          postfix += popped;

          recordStep({
            charIndex: i,
            character: ch,
            charType: 'operator',
            poppedChar: popped,
            newlyAddedPostfixChar: popped,
            comparedOps: {
              top: topOp,
              topPriority: topPriority,
              incoming: ch,
              incomingPriority: incomingPriority
            },
            action: `Pop Higher/Equal Precedence '${popped}'`,
            codeLine: this.cppLines.OPERATOR_PREC_LOOP,
            explanation: `Top of stack '${topOp}' (Priority ${topPriority}) has >= precedence than incoming '${ch}' (Priority ${incomingPriority}). Popped '${popped}' to postfix.`
          });
        }

        s.push(ch);
        operand = false;

        recordStep({
          charIndex: i,
          character: ch,
          charType: 'operator',
          pushedChar: ch,
          comparedOps: {
            incoming: ch,
            incomingPriority: incomingPriority,
            top: s.length > 1 ? s[s.length - 2] : 'None',
            topPriority: s.length > 1 ? this.priority(s[s.length - 2]) : 0
          },
          action: `Push Operator '${ch}'`,
          codeLine: this.cppLines.OPERATOR_PUSH,
          explanation: `'${ch}' (Priority ${incomingPriority}) pushed onto the stack. operand flag set to false (now expecting an operand).`
        });
      }

      else {
        // Unknown character
        this.isValid = false;
        this.errorCharIndex = i;
        this.errorMessage = `Unrecognized character '${ch}' at index ${i}.`;
        recordStep({
          charIndex: i,
          character: ch,
          charType: 'none',
          isError: true,
          action: `Invalid Expression: Illegal Character '${ch}'`,
          codeLine: this.cppLines.UNKNOWN_CHAR_INVALID,
          explanation: `Invalid Expression! Illegal character '${ch}' at index ${i}. Only alphanumeric operands (A-Z, a-z, 0-9), standard operators (+, -, *, /, ^), and parentheses are permitted.`
        });
        return this.steps;
      }
    }

    // End of string checks
    if (!operand) {
      this.isValid = false;
      this.errorCharIndex = infix.length - 1;
      this.errorMessage = 'Expression ended with an operator or opening parenthesis without a closing operand.';
      recordStep({
        charType: 'end',
        isError: true,
        action: 'Invalid Expression: Missing Trailing Operand',
        codeLine: this.cppLines.END_OPERAND_INVALID,
        explanation: 'Invalid Expression! The expression terminated with operand flag = false (e.g. trailing operator like "A+B+"). Missing right-hand operand.'
      });
      return this.steps;
    }

    // Unwind remaining operators from stack
    while (s.length > 0) {
      const topOp = s[s.length - 1];

      if (topOp === '(') {
        this.isValid = false;
        this.errorMessage = "Unmatched opening parenthesis '(' detected in stack.";
        recordStep({
          charType: 'end',
          isError: true,
          action: "Invalid Expression: Unmatched '('",
          codeLine: this.cppLines.END_UNWIND_UNMATCHED,
          explanation: "Invalid Expression! Found an unmatched opening parenthesis '(' remaining on the stack after end of input."
        });
        return this.steps;
      }

      const popped = s.pop();
      postfix += popped;

      recordStep({
        charType: 'end',
        poppedChar: popped,
        newlyAddedPostfixChar: popped,
        action: `Pop Remaining '${popped}' to Postfix`,
        codeLine: this.cppLines.END_UNWIND_POP,
        explanation: `End of expression reached. Popped remaining operator '${popped}' from stack and appended to postfix.`
      });
    }

    // Success Step
    this.finalPostfix = postfix;
    recordStep({
      charType: 'end',
      isComplete: true,
      action: 'Conversion Complete',
      codeLine: this.cppLines.CONVERT_RETURN,
      explanation: `Conversion complete! Final Postfix Expression: "${postfix}".`
    });

    return this.steps;
  }

  getStep(index) {
    if (index >= 0 && index < this.steps.length) {
      return this.steps[index];
    }
    return null;
  }

  getTotalSteps() {
    return this.steps.length;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InfixToPostfixEngine;
}
