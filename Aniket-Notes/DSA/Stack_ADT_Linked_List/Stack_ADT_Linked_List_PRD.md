# PRD — Stack ADT Using Linked List Demonstration

## 1. Product Overview

### Product Name
Stack ADT Using Linked List Visualizer

### Product Type
Interactive educational web application

### Purpose
Create a simple and interactive website that helps students understand how a Stack ADT works when implemented using a Linked List.

The website should visually demonstrate:
- LIFO (Last In, First Out)
- Nodes
- `TOP` pointer
- `next` pointer
- Push
- Pop
- Peek
- IsEmpty
- Clear
- Step-by-step execution
- C++ implementation
- Time and space complexity

---

## 2. Problem Statement

Students often understand Stack operations theoretically but find it difficult to visualize how nodes and pointers change during Push and Pop operations.

The product will solve this problem by providing an interactive visualization where users can perform Stack operations and immediately see how the Linked List changes.

---

## 3. Goals

### Primary Goals
1. Explain the Stack ADT in simple language.
2. Demonstrate the LIFO principle visually.
3. Show how a Stack is implemented using a Linked List.
4. Visualize the `TOP` pointer and `next` connections.
5. Allow users to perform Stack operations interactively.
6. Explain the corresponding C++ code.
7. Show operation complexity.

### Success Criteria
- A beginner can understand Push and Pop after using the visualization.
- Every operation updates the visual Stack correctly.
- The visualization clearly shows `TOP` and `NULL`.
- The C++ implementation matches the behavior of the visualizer.
- The interface works on desktop, tablet, and mobile.

---

## 4. Target Users

### Primary Users
- Computer science students
- Data Structures and Algorithms beginners
- College students learning C++
- Students preparing for practical exams and viva

### User Skill Level
Beginner to intermediate.

---

## 5. Technology Requirements

Use:

- HTML5
- CSS3
- JavaScript
- C++ code displayed as educational reference

No backend is required.

No database is required.

The application should run entirely in the browser.

---

## 6. Core Concept

A Stack follows the:

**LIFO — Last In, First Out**

Example:

Push:
`10 → 20 → 30`

Result:

```text
TOP
 ↓
[30]
[20]
[10]
 ↓
NULL
```

When Pop is performed, `30` is removed first.

The Stack is implemented using Linked List nodes.

Each node contains:

```text
┌───────────────┐
│ Data │ Next   │
└───────────────┘
```

The `TOP` pointer points to the first node.

---

# 7. Functional Requirements

## 7.1 Push Operation

### Description
Add a new node to the top of the Stack.

### User Flow
1. User enters a value.
2. User clicks `Push`.
3. A new node is created.
4. New node stores the value.
5. New node's `next` points to the current TOP.
6. TOP moves to the new node.
7. New node is animated into position.
8. Operation history is updated.

### Example

Before:

```text
TOP
 ↓
[20]
[10]
```

Push `30`:

```text
TOP
 ↓
[30]
[20]
[10]
```

### Message
`Pushed 30 onto the stack.`

### Complexity
Time: `O(1)`

---

## 7.2 Pop Operation

### Description
Remove the node currently pointed to by TOP.

### User Flow
1. User clicks `Pop`.
2. Check whether Stack is empty.
3. Store current TOP.
4. Move TOP to `TOP->next`.
5. Remove the old node.
6. Animate the node leaving the Stack.
7. Update Stack size and operation history.

### Example

Before:

```text
TOP
 ↓
[30]
[20]
[10]
```

After Pop:

```text
TOP
 ↓
[20]
[10]
```

### Message
`Popped 30 from the stack.`

### Empty Stack Message
`Stack Underflow — Stack is empty.`

### Complexity
Time: `O(1)`

---

## 7.3 Peek Operation

### Description
Display the value at TOP without removing it.

### User Flow
1. User clicks `Peek`.
2. If Stack is empty, show an empty message.
3. Otherwise highlight TOP.
4. Display its value.

### Message
`Top Element: 30`

### Complexity
Time: `O(1)`

---

## 7.4 IsEmpty Operation

### Description
Check whether the Stack contains any nodes.

### Logic

```text
TOP == NULL
```

### Messages

If empty:

`Stack is Empty`

If not empty:

`Stack is Not Empty`

### Complexity
Time: `O(1)`

---

## 7.5 Clear Operation

### Description
Remove all nodes from the Stack.

### User Flow
1. User clicks `Clear`.
2. Remove all nodes.
3. Set TOP to NULL.
4. Animate nodes being removed.
5. Reset Stack size.
6. Update status.

### Final State

```text
TOP → NULL
```

### Message
`Stack cleared successfully.`

---

# 8. User Interface

## 8.1 Header

Display:

**Stack ADT — Linked List**

Navigation:

- Introduction
- Visualization
- Operations
- C++ Code
- Complexity

Include:

- Light/Dark mode toggle

---

## 8.2 Introduction Section

Explain:

A Stack is a linear data structure that follows the LIFO principle.

The last element inserted is the first element removed.

Show a simple example:

```text
Push 10
Push 20
Push 30

TOP
 ↓
[30]
[20]
[10]
```

---

## 8.3 Visualization Section

This is the main section of the website.

Display:

```text
             TOP
              ↓
        ┌───────────┐
        │ Data: 30  │
        │ Next ─────┼────┐
        └───────────┘    ↓
        ┌───────────┐
        │ Data: 20  │
        │ Next ─────┼────┐
        └───────────┘    ↓
        ┌───────────┐
        │ Data: 10  │
        │ Next ─────┼──→ NULL
        └───────────┘
```

### Visual Rules

- Nodes are displayed vertically.
- TOP always points to the first node.
- Each node displays Data and Next.
- Arrows represent `next` pointers.
- The last node points to NULL.
- New nodes appear at the top.
- Removed nodes disappear from the top.
- TOP must update after Push and Pop.

---

# 9. Controls

Provide:

### Input

`Enter value`

### Buttons

- `Push`
- `Pop`
- `Peek`
- `Is Empty`
- `Clear`
- `Step Mode`
- `Reset`

Buttons should have clear disabled states when an operation cannot be performed.

---

# 10. Step-by-Step Mode

The website should support a step-by-step explanation of operations.

## Push Steps

### Step 1 — Create Node

```text
NEW NODE
┌──────────────┐
│ 30 │ Next │
└──────────────┘
```

### Step 2 — Connect Node

```text
[30] → [20] → [10] → NULL
         ↑
        TOP
```

### Step 3 — Update TOP

```text
TOP
 ↓
[30] → [20] → [10] → NULL
```

Display a short explanation for each step.

---

## Pop Steps

### Step 1
Identify the TOP node.

### Step 2
Move TOP to the next node.

### Step 3
Delete the old TOP node.

Example:

```text
Before:

TOP
 ↓
[30] → [20] → [10]

After:

TOP
 ↓
[20] → [10]
```

---

# 11. LIFO Demonstration

Provide a dedicated visual section for LIFO.

User pushes:

```text
10
20
30
40
```

Display:

```text
TOP
 ↓
[40]
[30]
[20]
[10]
```

Pop sequence:

```text
40 → 30 → 20 → 10
```

Clearly state:

**The last element inserted is the first element removed.**

---

# 12. Operation History

Display a live operation history.

Example:

```text
Operation History

✓ PUSH 10
✓ PUSH 20
✓ PUSH 30
✓ PEEK → 30
✓ POP → 30
```

Newest operation should appear first or be clearly distinguishable.

---

# 13. Stack Information Panel

Display live information:

```text
Stack Size: 3
TOP Value: 30
Status: Not Empty
```

When empty:

```text
Stack Size: 0
TOP Value: NULL
Status: Empty
```

---

# 14. C++ Code Section

Display the C++ implementation with syntax highlighting.

```cpp
#include <iostream>
using namespace std;

class Stack {
    struct Node {
        int data;
        Node* next;
    };

    Node* top;

public:
    Stack() {
        top = NULL;
    }

    void push(int value) {
        Node* newNode = new Node;
        newNode->data = value;
        newNode->next = top;
        top = newNode;
    }

    void pop() {
        if (top == NULL) {
            cout << "Stack Underflow";
            return;
        }

        Node* temp = top;
        top = top->next;
        delete temp;
    }

    void peek() {
        if (top == NULL) {
            cout << "Stack is Empty";
            return;
        }

        cout << "Top Element: " << top->data;
    }

    bool isEmpty() {
        return top == NULL;
    }
};

int main() {
    Stack s;

    s.push(10);
    s.push(20);
    s.push(30);

    s.pop();

    s.peek();

    return 0;
}
```

Include a `Copy Code` button.

---

# 15. Complexity Section

Display:

| Operation | Time Complexity |
|---|---|
| Push | O(1) |
| Pop | O(1) |
| Peek | O(1) |
| IsEmpty | O(1) |
| Clear | O(n) |

### Space Complexity

`O(n)`

Where `n` is the number of nodes in the Stack.

---

# 16. Linked List vs Array

Provide a comparison table.

| Feature | Linked List | Array |
|---|---|---|
| Size | Dynamic | Fixed |
| Push | O(1) | O(1) |
| Pop | O(1) | O(1) |
| Memory | Dynamic allocation | Pre-allocated |
| Overflow | When memory is unavailable | When array is full |

Explain:

A Linked List implementation is useful when the Stack size is not known in advance.

---

# 17. Animations

Use simple animations for:

### Push
- New node slides into the top.
- TOP pointer moves to the new node.
- Pointer connection appears.

### Pop
- TOP node is highlighted.
- TOP pointer moves down.
- Node disappears.

### Peek
- TOP node gets highlighted temporarily.

### Clear
- Nodes are removed sequentially or with a smooth transition.

Animations should be quick and educational rather than decorative.

---

# 18. Error Handling

## Push Without Value

Display:

`Please enter a value.`

## Pop on Empty Stack

Display:

`Stack Underflow — Stack is empty.`

## Peek on Empty Stack

Display:

`Stack is Empty.`

Do not crash or create invalid nodes.

---

# 19. Responsive Design

The website must work on:

- Desktop
- Laptop
- Tablet
- Mobile

On small screens:

- Stack visualization remains readable.
- Controls should wrap appropriately.
- Code section should support horizontal scrolling.
- Navigation should collapse into a mobile-friendly layout.

---

# 20. Accessibility

Include:

- Clear button labels
- Sufficient text contrast
- Keyboard-accessible controls
- Visible focus states
- Descriptive status messages
- Avoid relying only on color to communicate state

---

# 21. Dark and Light Mode

Provide both modes.

### Light Mode
Clean white/light background with readable dark text.

### Dark Mode
Dark background with readable light text.

The visualization, code block, buttons, cards, and status indicators should adapt to the selected mode.

Save the user's selected theme in `localStorage`.

---

# 22. Data Handling

The Stack should be maintained in JavaScript using a data structure representing Linked List nodes.

Conceptually:

```javascript
{
    data: value,
    next: anotherNode
}
```

The visual representation must reflect the actual Stack state.

Do not hard-code the visualization.

---

# 23. Suggested JavaScript Logic

Core operations should follow the same logic as the C++ implementation.

### Push

```text
newNode.next = top
top = newNode
```

### Pop

```text
temp = top
top = top.next
delete temp
```

### Peek

```text
top.data
```

### IsEmpty

```text
top == null
```

---

# 24. Non-Functional Requirements

### Performance
Operations should update instantly.

### Reliability
The visualization and Stack state must always remain synchronized.

### Simplicity
Explanations should be beginner-friendly.

### Maintainability
HTML, CSS, and JavaScript should be organized clearly.

### Browser Support
Support modern Chrome, Edge, Firefox, and Safari.

---

# 25. Out of Scope

The first version does not require:

- User accounts
- Backend
- Database
- Authentication
- Online code compilation
- Multiplayer
- Persistent Stack data between sessions

---

# 26. Recommended Page Layout

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
│ Stack ADT — Linked List     Theme Toggle   │
├─────────────────────────────────────────────┤
│ Introduction                                │
│ LIFO explanation                            │
├─────────────────────────────────────────────┤
│ Interactive Visualization                   │
│                                             │
│ Input: [      ]                             │
│ [Push] [Pop] [Peek] [Is Empty] [Clear]      │
│                                             │
│                 TOP                         │
│                  ↓                          │
│                [30]                         │
│                  ↓                          │
│                [20]                         │
│                  ↓                          │
│                [10]                         │
│                  ↓                          │
│                 NULL                        │
├─────────────────────────────────────────────┤
│ Stack Information                           │
│ Size: 3 | TOP: 30 | Status: Not Empty      │
├─────────────────────────────────────────────┤
│ Operation History                           │
├─────────────────────────────────────────────┤
│ Step-by-Step Explanation                    │
├─────────────────────────────────────────────┤
│ C++ Implementation                          │
├─────────────────────────────────────────────┤
│ Complexity                                  │
├─────────────────────────────────────────────┤
│ Linked List vs Array                        │
├─────────────────────────────────────────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘
```

---

# 27. Final Product Requirement

Build the website as an **interactive Stack ADT learning tool**, not simply a page containing theory.

The most important feature is the live visualization.

When a student performs:

`Push → Pop → Peek → IsEmpty → Clear`

the website must clearly show how:

- Nodes are created
- Nodes are connected
- TOP changes
- Nodes are removed
- NULL is reached
- LIFO works

The visualization and C++ implementation should use the same conceptual logic so that students can directly connect the visual demonstration with the C++ code.
