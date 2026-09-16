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
            }

            else if (ch == ')') {
                if (!operand) return "Invalid Expression";

                while (!s.empty() && s.top() != '(') {
                    postfix += s.top();
                    s.pop();
                }

                if (s.empty()) return "Invalid Expression";

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

        if (!operand) return "Invalid Expression";

        while (!s.empty()) {
            if (s.top() == '(') return "Invalid Expression";

            postfix += s.top();
            s.pop();
        }

        return postfix;
    }
};

int main() {
    InfixToPostfix obj;

    // Test default expression
    string infix = "A+B*(C-D)";
    cout << "--- Test 1 ---\n";
    cout << "Infix:   " << infix << "\n";
    cout << "Postfix: " << obj.convert(infix) << "\n\n";

    // Test secondary expression
    string infix2 = "A+B*C";
    cout << "--- Test 2 ---\n";
    cout << "Infix:   " << infix2 << "\n";
    cout << "Postfix: " << obj.convert(infix2) << "\n\n";

    // Test invalid expression
    string invalid = "A++B";
    cout << "--- Test 3 (Invalid) ---\n";
    cout << "Infix:   " << invalid << "\n";
    cout << "Result:  " << obj.convert(invalid) << "\n";

    return 0;
}
