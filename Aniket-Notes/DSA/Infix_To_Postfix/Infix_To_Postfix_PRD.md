# PRD & DSA Notes — Infix to Postfix Conversion (Stack Application)

---

## 1. Overview & Concept Summary

### Topic Name
**Infix to Postfix Conversion using Stack ADT (with Complete Syntactic Validation)**

### What is Expression Notation?
In computer science, arithmetic expressions can be written in three distinct syntactic notations depending on the position of the operator relative to its operands:

1. **Infix Notation:** Operators are written *between* operands (e.g., `A + B`).
   - Natural and intuitive for humans.
   - Requires operator precedence rules, associativity rules, and parentheses `()` to override default precedence order.
2. **Postfix Notation (Reverse Polish Notation / RPN):** Operators are written *after* their respective operands (e.g., `A B +`).
   - Devised by Australian philosopher and computer scientist Charles L. Hamblin in the mid-1950s.
   - Does **not require parentheses** or precedence rules during evaluation.
   - Readily evaluated in a single linear pass using a stack.
3. **Prefix Notation (Polish Notation):** Operators are written *before* their operands (e.g., `+ A B`).

### Why Do Compilers Convert Infix to Postfix?
Computers, CPU parsers, bytecode interpreters (like JVM and Python VM), and hardware calculators cannot easily evaluate infix expressions directly because doing so requires scanning back and forth across the string to locate parentheses and highest-precedence operators. 

By converting infix expressions into postfix notation:
- Expressions are evaluated in a single linear scan from left to right in $\mathcal{O}(N)$ time.
- Parentheses are completely eliminated from the output.
- Operator precedence is inherently encoded in the sequence of operators.

---

## 2. Operator Precedence & Associativity

In our implementation, operators follow standard algebraic precedence:

| Operator | Description | Priority Level | Associativity | C++ Return Value |
| :---: | :---: | :---: | :---: | :---: |
| **`^`** | Exponentiation | **3 (Highest)** | Right to Left | `return 3;` |
| **`*` , `/`** | Multiplication, Division | **2 (Medium)** | Left to Right | `return 2;` |
| **`+` , `-`** | Addition, Subtraction | **1 (Lowest)** | Left to Right | `return 1;` |
| **`(`** | Opening Parenthesis | **0 (Sentinel)** | N/A | `return 0;` |

### Precedence Function in C++
```cpp
int priority(char ch) {
    if (ch == '^') return 3;
    if (ch == '*' || ch == '/') return 2;
    if (ch == '+' || ch == '-') return 1;
    return 0;
}
```

---

## 3. The C++ Algorithm & Syntactic Validation Logic

The algorithm uses an operator stack `stack<char> s`, an output accumulator `string postfix`, and a boolean flag `bool operand` to enforce strict grammatical validity while converting.

### The Role of `bool operand`
The `operand` flag tracks whether the parser is currently expecting an **operator** (`operand == true`) or an **operand** (`operand == false`):

| State of `operand` | What Just Happened | What Is Expected Next |
| :---: | :--- | :--- |
| `false` (Initial) | Start of string, or just pushed an operator or `(` | An **operand** (alphanumeric) or `(` |
| `true` | Just read an operand or resolved a parenthesized expression `)` | An **operator** (`+,-,*,/,^`) or `)` |

### Step-by-Step Character Processing Rules

```text
Initialize: stack<char> s, string postfix = "", bool operand = false

For each character 'ch' in infix:
  1. If isalnum(ch) [Operand]:
       - If operand == true -> INVALID (Consecutive operands without operator, e.g. "AB")
       - Append ch to postfix: postfix += ch
       - Set operand = true

  2. Else if ch == '(':
       - If operand == true -> INVALID (Missing operator before '(', e.g. "A(B+C)")
       - Push '(' onto stack: s.push('(')
       - Set operand = false

  3. Else if ch == ')':
       - If operand == false -> INVALID (Empty parens "()" or trailing operator before ')', e.g. "(A+)")
       - Pop from stack and append to postfix until top of stack is '('
       - If stack becomes empty without finding '(' -> INVALID (Mismatched ')')
       - Pop '(' from stack
       - Set operand = true (Parenthesized block acts as a resolved operand)

  4. Else if isOperator(ch):
       - If operand == false -> INVALID (Operator at start "+A" or consecutive operators "A++B")
       - While stack not empty AND top != '(' AND priority(top) >= priority(ch):
           postfix += top; pop()
       - Push ch onto stack: s.push(ch)
       - Set operand = false

  5. Else:
       - Unknown character (e.g. '@', '$', space) -> INVALID

After loop finishes:
  - If operand == false -> INVALID (Expression ended with an operator, e.g. "A+B+")
  - Pop remaining operators from stack to postfix:
      - If an unmatched '(' is encountered -> INVALID (Missing ')')
      - Append top to postfix, pop()

Return postfix
```

---

## 4. Detailed Execution Trace: `A+B*(C-D)`

Let us trace the conversion of the canonical expression:
$$\mathbf{A + B * (C - D)}$$

| Step | Character | Type | `operand` | Stack `(Bottom → Top)` | Postfix Output | Explanation |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **0** | *Init* | — | `false` | `[ ]` | `""` | Initial state. |
| **1** | `'A'` | Operand | `true` | `[ ]` | `"A"` | Operand added directly to postfix. `operand = true`. |
| **2** | `'+'` | Operator | `false` | `[ + ]` | `"A"` | Stack empty $\implies$ Push `+`. `operand = false`. |
| **3** | `'B'` | Operand | `true` | `[ + ]` | `"AB"` | Operand added to postfix. `operand = true`. |
| **4** | `'*'` | Operator | `false` | `[ +, * ]` | `"AB"` | Priority(`*`) = 2 > Priority(`+`) = 1 $\implies$ Push `*`. |
| **5** | `'('` | Open Paren | `false` | `[ +, *, ( ]` | `"AB"` | Push `(` directly to stack. `operand = false`. |
| **6** | `'C'` | Operand | `true` | `[ +, *, ( ]` | `"ABC"` | Operand added to postfix. `operand = true`. |
| **7** | `'-'` | Operator | `false` | `[ +, *, (, - ]`| `"ABC"` | Top is `(` $\implies$ Push `-`. `operand = false`. |
| **8** | `'D'` | Operand | `true` | `[ +, *, (, - ]`| `"ABCD"` | Operand added to postfix. `operand = true`. |
| **9** | `')'` | Close Paren| `true` | `[ +, * ]` | `"ABCD-"` | Pop `-` to postfix until `(`. Discard `(`. |
| **10**| *End* | — | `true` | `[ ]` | `"ABCD-*+"` | Unwind stack: Pop `*`, then pop `+` to postfix. |

**Final Postfix Expression:**
$$\mathbf{ABCD-*+}$$

---

## 5. Invalid Expression Guide & Failure Detection

The algorithm detects syntax errors instantly at the exact invalid character:

| Input Expression | Failure Point | C++ Condition Triggered | Why It Is Invalid |
| :--- | :---: | :--- | :--- |
| `+A` | `+` at idx 0 | `isOperator && !operand` | Expression cannot begin with a binary operator. |
| `A++B` | 2nd `+` | `isOperator && !operand` | Two consecutive operators with no operand between them. |
| `AB` | `B` at idx 1 | `isalnum && operand` | Two consecutive operands without an operator. |
| `A(B+C)` | `(` at idx 1 | `ch == '(' && operand` | Missing multiplication operator between `A` and `(`. |
| `A+B*` | End of string | `!operand` after loop | Trailing operator missing its right operand. |
| `(A+B` | End of string | `s.top() == '('` while emptying | Unmatched opening parenthesis. |
| `A+B)` | `)` at idx 3 | `s.empty()` in paren loop | Unmatched closing parenthesis (no matching `(`). |
| `A+()` | `)` at idx 3 | `ch == ')' && !operand` | Empty parentheses are grammatically illegal. |
| `A@B` | `@` at idx 1 | `else return "Invalid Expression"` | Illegal character outside alphanumeric / operator set. |

---

## 6. Complete C++ Implementation

```cpp
#include <iostream>
#include <stack>
#include <cctype>
using namespace std;

class InfixToPostfix {
public:
    int priority(char ch) {
        if (ch == '^') return 3;
        if (ch == '*' || ch == '/') return 2;
        if (ch == '+' || ch == '-') return 1;
        return 0;
    }

    bool isOperator(char ch) {
        return ch == '+' || ch == '-' ||
               ch == '*' || ch == '/' || ch == '^';
    }

    string convert(string infix) {
        stack<char> s;
        string postfix = "";
        bool operand = false;

        for (char ch : infix) {

            if (isalnum(ch)) {
                if (operand) return "Invalid Expression";

                postfix += ch;
                operand = true;
            }

            else if (ch == '(') {
                if (operand) return "Invalid Expression";

                s.push(ch);
                operand = false;
            }

            else if (ch == ')') {
                if (!operand) return "Invalid Expression";

                while (!s.empty() && s.top() != '(') {
                    postfix += s.top();
                    s.pop();
                }

                if (s.empty())
                    return "Invalid Expression";

                s.pop();
                operand = true;
            }

            else if (isOperator(ch)) {
                if (!operand) return "Invalid Expression";

                while (!s.empty() && s.top() != '(' &&
                       priority(s.top()) >= priority(ch)) {
                    postfix += s.top();
                    s.pop();
                }

                s.push(ch);
                operand = false;
            }

            else {
                return "Invalid Expression";
            }
        }

        if (!operand)
            return "Invalid Expression";

        while (!s.empty()) {
            if (s.top() == '(')
                return "Invalid Expression";

            postfix += s.top();
            s.pop();
        }

        return postfix;
    }
};

int main() {
    InfixToPostfix obj;

    string infix;

    cout << "Enter Infix: ";
    cin >> infix;

    cout << "Postfix: " << obj.convert(infix) << endl;

    return 0;
}
```

---

## 7. Complexity Analysis

### Time Complexity: $\mathcal{O}(N)$
- Each character in the infix string of length $N$ is examined exactly once in the main `for` loop.
- Each operator is pushed onto the stack at most once.
- Each operator is popped from the stack at most once.
- Therefore, the total number of stack operations across the entire algorithm is bounded by $2N$.
- Total Time: $\mathcal{O}(N)$ (Linear Time).

### Auxiliary Space Complexity: $\mathcal{O}(N)$
- The operator stack `stack<char> s` stores at most $N$ operators and parentheses in the worst-case (e.g., `((((A+B))))`).
- Total Auxiliary Space: $\mathcal{O}(N)$.

---

## 8. Comparison Matrix: Infix vs Prefix vs Postfix

| Feature | Infix | Postfix (RPN) | Prefix |
| :--- | :--- | :--- | :--- |
| **Operator Position** | Between operands (`A + B`) | After operands (`A B +`) | Before operands (`+ A B`) |
| **Parentheses Required?** | **Yes** (to override precedence) | **No** (never needed) | **No** (never needed) |
| **Evaluation Direction** | Multi-pass (precedence rules) | Single-pass Left-to-Right | Single-pass Right-to-Left |
| **Compiler Usage** | Source code input | Bytecode execution, stack machines | Lisp, AST representations |
| **Human Readability** | High | Low | Low |

---

## 9. Frequently Asked Viva & Interview Questions

### Q1: Why is an operator popped from the stack when a new operator with lower or equal precedence arrives?
**Answer:** Because operators with higher or equal precedence must be executed *before* the new operator. In postfix notation, the operator to be evaluated first appears earlier in the string, so it must be popped and appended to the output before pushing the new lower-precedence operator.

### Q2: Why is `(` treated as priority 0 inside the stack?
**Answer:** When `(` is pushed onto the stack, it acts as a delimiter for a sub-expression. Any subsequent operators pushed inside the parentheses must not pop the `(`, so `(` is given the lowest priority (0) to ensure other operators can sit on top of it.

### Q3: What is the purpose of the `bool operand` variable in the C++ code?
**Answer:** It acts as a two-state grammar parser flag. It ensures that operands and operators alternate strictly. It catches leading operators (`+A`), consecutive operators (`A++B`), consecutive operands (`AB`), and missing operands inside parentheses (`A+()`).

### Q4: How is associativity handled during conversion?
**Answer:** For left-associative operators (`+`, `-`, `*`, `/`), when an incoming operator has the *same* priority as the top of the stack, the top operator is popped (`>=` condition). For right-associative operators (like `^`), the condition would strictly be `>` so that identical operators can be stacked.
