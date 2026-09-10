# PRD — Queue ADT Using Linked List Demonstration

## 1. Product Overview

### Product Name
Queue ADT Using Linked List Visualizer

### Product Type
Interactive educational web application

### Purpose
Create a simple and interactive website that helps students understand how a Queue ADT works when implemented using a Linked List.

The website should visually demonstrate:
- FIFO (First In, First Out)
- Linked List based Queue
- FRONT pointer
- REAR pointer
- Nodes
- Data and Next fields
- Enqueue
- Dequeue
- Peek
- IsEmpty
- Clear
- Step-by-step execution
- C++ implementation
- Time and space complexity

---

## 2. Problem Statement

Students often understand the Queue concept theoretically but find it difficult to visualize how FRONT and REAR pointers work with Linked List nodes.

The product will solve this problem by providing an interactive visualization where users can perform Queue operations and immediately see how nodes are created, connected, and removed.

---

## 3. Goals

### Primary Goals
1. Explain the Queue ADT in simple language.
2. Demonstrate the FIFO principle visually.
3. Show how a Queue is implemented using a Linked List.
4. Visualize FRONT and REAR pointers.
5. Show how nodes are connected using `next`.
6. Allow users to perform Queue operations interactively.
7. Explain the corresponding C++ code.
8. Show operation complexity.

### Success Criteria
- A beginner can understand Enqueue and Dequeue after using the visualization.
- Every operation updates the visual Queue correctly.
- FRONT and REAR are clearly visible.
- Node connections are clearly shown.
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

# 6. Core Concept

A Queue follows the:

**FIFO — First In, First Out**

The first element inserted is the first element removed.

Example:

Enqueue:

`10 → 20 → 30`

Queue:

```text
FRONT                                           REAR
  ↓                                               ↓
┌────────────┐     ┌────────────┐     ┌────────────┐
│ Data: 10   │     │ Data: 20   │     │ Data: 30   │
│ Next ──────┼────→│ Next ──────┼────→│ Next → NULL│
└────────────┘     └────────────┘     └────────────┘
```

The FRONT points to the first node.

The REAR points to the last node.

---

# 7. Linked List Representation

Each node contains:

```text
┌───────────────────┐
│ Data │    Next    │
└───────────────────┘
```

Example:

```text
FRONT                                      REAR
  ↓                                          ↓
┌───────┬───────┐    ┌───────┬───────┐    ┌───────┬───────┐
│  10   │   •───┼───→│  20   │   •───┼───→│  30   │ NULL  │
└───────┴───────┘    └───────┴───────┘    └───────┴───────┘
```

When the Queue is empty:

```text
FRONT → NULL
REAR  → NULL
```

---

# 8. Functional Requirements

## 8.1 Enqueue Operation

### Description
Add a new node at the REAR of the Queue.

### User Flow
1. User enters a value.
2. User clicks `Enqueue`.
3. Create a new node.
4. Store the value in the node.
5. Set the new node's `next` to NULL.
6. If the Queue is empty, set both FRONT and REAR to the new node.
7. Otherwise, connect the current REAR to the new node.
8. Move REAR to the new node.
9. Animate the new node entering from the REAR.
10. Update Queue size and operation history.

### Example

Before:

```text
FRONT                          REAR
  ↓                              ↓
[10] → [20] → NULL
```

Enqueue `30`:

```text
FRONT                                  REAR
  ↓                                      ↓
[10] → [20] → [30] → NULL
```

### C++ Logic

```cpp
Node* newNode = new Node;
newNode->data = value;
newNode->next = NULL;

if (front == NULL) {
    front = rear = newNode;
}
else {
    rear->next = newNode;
    rear = newNode;
}
```

### Message
`Enqueued 30 into the queue.`

### Complexity
Time: `O(1)`

---

# 9. Dequeue Operation

### Description
Remove the node from the FRONT of the Queue.

### User Flow
1. User clicks `Dequeue`.
2. Check whether Queue is empty.
3. Store the current FRONT node.
4. Move FRONT to `FRONT->next`.
5. Delete the old FRONT node.
6. If FRONT becomes NULL, set REAR to NULL.
7. Animate the removed node.
8. Update Queue size and operation history.

### Example

Before:

```text
FRONT                                  REAR
  ↓                                      ↓
[10] → [20] → [30] → NULL
```

After Dequeue:

```text
        FRONT                          REAR
          ↓                              ↓
[20] → [30] → NULL
```

### C++ Logic

```cpp
if (front == NULL) {
    cout << "Queue Underflow";
    return;
}

Node* temp = front;
front = front->next;
delete temp;

if (front == NULL)
    rear = NULL;
```

### Message
`Dequeued 10 from the queue.`

### Empty Queue Message
`Queue Underflow — Queue is empty.`

### Complexity
Time: `O(1)`

---

# 10. Peek Operation

### Description
Display the value at FRONT without removing it.

### User Flow
1. User clicks `Peek`.
2. Check whether Queue is empty.
3. Highlight the FRONT node.
4. Display its value.
5. Do not modify the Queue.

### Example

```text
FRONT
  ↓
┌────────────┐
│    20      │ ← FRONT ELEMENT
└────────────┘
```

### Message
`Front Element: 20`

### Complexity
Time: `O(1)`

---

# 11. IsEmpty Operation

### Description
Check whether the Queue contains any nodes.

### Logic

```text
FRONT == NULL
```

### Messages

If empty:

`Queue is Empty`

If not empty:

`Queue is Not Empty`

### Complexity
Time: `O(1)`

---

# 12. Clear Operation

### Description
Remove all nodes from the Queue.

### User Flow
1. User clicks `Clear`.
2. Remove each node.
3. Set FRONT to NULL.
4. Set REAR to NULL.
5. Reset Queue size.
6. Animate nodes being removed.

### Final State

```text
FRONT → NULL
REAR  → NULL
```

### Message
`Queue cleared successfully.`

### Complexity
Time: `O(n)`

---

# 13. User Interface

## 13.1 Header

Display:

**Queue ADT — Linked List**

Navigation:

- Introduction
- Visualization
- Operations
- C++ Code
- Complexity

Include:

- Light/Dark mode toggle

---

# 14. Introduction Section

Explain:

A Queue is a linear data structure that follows the FIFO principle.

The first element inserted is the first element removed.

Example:

```text
Enqueue 10
Enqueue 20
Enqueue 30

FRONT                                      REAR
  ↓                                          ↓
[10] → [20] → [30] → NULL
```

Explain that a Linked List Queue uses nodes instead of fixed-size array positions.

---

# 15. Interactive Visualization

This is the main section of the website.

Display the Queue horizontally so that the direction of the Queue is obvious.

Example:

```text
             FRONT                                      REAR
               ↓                                          ↓
        ┌────────────┐      ┌────────────┐      ┌────────────┐
        │ Data: 10   │      │ Data: 20   │      │ Data: 30   │
        │ Next:  •───┼─────→│ Next:  •───┼─────→│ Next: NULL │
        └────────────┘      └────────────┘      └────────────┘
```

Use arrows to clearly represent `next`.

The last node must point to `NULL`.

---

# 16. Controls

Provide:

### Input

`Enter value`

### Buttons

- `Enqueue`
- `Dequeue`
- `Peek`
- `Is Empty`
- `Clear`
- `Step Mode`
- `Reset`

---

# 17. Enqueue Visualization

When the user enters `40` and clicks Enqueue:

Before:

```text
FRONT                          REAR
  ↓                              ↓
[10] → [20] → [30] → NULL
```

After:

```text
FRONT                                  REAR
  ↓                                      ↓
[10] → [20] → [30] → [40] → NULL
```

Animate the new node entering from the REAR side.

Display:

`New node created.`

Then:

`REAR->next connected to the new node.`

Then:

`REAR moved to the new node.`

---

# 18. Dequeue Visualization

When Dequeue is clicked:

Before:

```text
FRONT                                  REAR
  ↓                                      ↓
[10] → [20] → [30] → NULL
```

Highlight `10`.

Show:

```text
TEMP
 ↓
[10]
```

Then move FRONT:

```text
        FRONT                    REAR
          ↓                        ↓
[20] → [30] → NULL
```

Finally delete the old node.

Display:

`FRONT moved to the next node.`

---

# 19. Empty Queue Behavior

When the Queue contains no nodes:

```text
FRONT → NULL

REAR → NULL
```

The visualization should display:

**Queue is Empty**

Do not show any fake node.

---

# 20. FIFO Demonstration

Create a dedicated section:

**FIFO — First In, First Out**

User enqueues:

```text
10
20
30
40
```

Queue becomes:

```text
FRONT                                      REAR
  ↓                                          ↓
[10] → [20] → [30] → [40] → NULL
```

Dequeue sequence:

```text
10 → 20 → 30 → 40
```

Clearly explain:

**The first element inserted is the first element removed.**

---

# 21. Step-by-Step Mode

Provide a `Next Step` button.

## Enqueue Steps

### Step 1 — Create Node

```text
NEW NODE

┌──────────────┐
│ Data: 30     │
│ Next: NULL   │
└──────────────┘
```

Display:

`A new node is created.`

### Step 2 — Check Queue

If empty:

```text
front = rear = newNode
```

Otherwise:

```text
rear->next = newNode
```

### Step 3 — Update REAR

```text
rear = newNode
```

### Final State

```text
FRONT
  ↓
[10] → [20] → [30] → NULL
                         ↑
                        REAR
```

---

# 22. Dequeue Steps

### Step 1 — Check Empty

```text
front == NULL
```

### Step 2 — Store FRONT

```text
temp = front
```

### Step 3 — Move FRONT

```text
front = front->next
```

### Step 4 — Delete Old Node

```text
delete temp
```

### Step 5 — Update REAR

If the Queue becomes empty:

```text
rear = NULL
```

---

# 23. Queue Information Panel

Display live information:

```text
Queue Size: 3
FRONT Value: 10
REAR Value: 30
Status: Not Empty
```

When empty:

```text
Queue Size: 0
FRONT Value: NULL
REAR Value: NULL
Status: Empty
```

---

# 24. Operation History

Display a live operation history.

Example:

```text
Operation History

✓ ENQUEUE 10
✓ ENQUEUE 20
✓ ENQUEUE 30
✓ PEEK → 10
✓ DEQUEUE → 10
✓ ENQUEUE 40
```

---

# 25. Pointer Visualization

The website must clearly show the relationship between FRONT and REAR.

Example:

```text
FRONT                                      REAR
  ↓                                          ↓
┌────────┐     ┌────────┐     ┌────────┐
│  10    │ ──→ │  20    │ ──→ │  30    │ ──→ NULL
└────────┘     └────────┘     └────────┘
```

When a new node is added:

```text
FRONT                                                REAR
  ↓                                                    ↓
[10] ──→ [20] ──→ [30] ──→ [40] ──→ NULL
```

When the first node is removed:

```text
        FRONT                              REAR
          ↓                                  ↓
[20] ──→ [30] ──→ [40] ──→ NULL
```

---

# 26. Special Case — First Enqueue

When the Queue is initially empty:

```text
FRONT → NULL
REAR  → NULL
```

After Enqueue `10`:

```text
              FRONT & REAR
                    ↓
                 [10]
                   ↓
                  NULL
```

Both FRONT and REAR must point to the same node.

This should be clearly animated and explained.

---

# 27. Special Case — Last Dequeue

When only one node remains:

```text
FRONT & REAR
      ↓
    [10]
      ↓
     NULL
```

After Dequeue:

```text
FRONT → NULL
REAR  → NULL
```

The website must clearly show both pointers becoming NULL.

---

# 28. C++ Code Section

Display the following simple C++ implementation with syntax highlighting:

```cpp
#include <iostream>
using namespace std;

class Queue {
    struct Node {
        int data;
        Node* next;

        Node(int value) {
            data = value;
            next = NULL;
        }
    };

    Node* front;
    Node* rear;

public:
    Queue() {
        front = NULL;
        rear = NULL;
    }

    // Insert element
    void enqueue(int value) {
        Node* newNode = new Node(value);

        if (rear == NULL) {
            front = rear = newNode;
            return;
        }

        rear->next = newNode;
        rear = newNode;
    }

    // Remove element
    void dequeue() {
        if (front == NULL) {
            cout << "Queue Underflow" << endl;
            return;
        }

        Node* temp = front;
        cout << "Deleted: " << temp->data << endl;

        front = front->next;

        if (front == NULL)
            rear = NULL;

        delete temp;
    }

    // Show front element
    void peek() {
        if (front == NULL) {
            cout << "Queue is Empty" << endl;
            return;
        }

        cout << "Front: " << front->data << endl;
    }

    // Display queue
    void display() {
        if (front == NULL) {
            cout << "Queue is Empty" << endl;
            return;
        }

        Node* temp = front;

        while (temp != NULL) {
            cout << temp->data << " ";
            temp = temp->next;
        }

        cout << endl;
    }
};

int main() {
    Queue q;

    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    q.enqueue(40);

    cout << "Queue: ";
    q.display();

    q.peek();

    q.dequeue();
    q.dequeue();

    cout << "Queue after dequeue: ";
    q.display();

    return 0;
}
```

Include a `Copy Code` button.

---

# 29. Complexity Section

Display:

| Operation | Time Complexity |
|---|---|
| Enqueue | O(1) |
| Dequeue | O(1) |
| Peek | O(1) |
| IsEmpty | O(1) |
| Clear | O(n) |

### Space Complexity

`O(n)`

Where `n` is the number of nodes in the Queue.

Explain:

The Linked List Queue does not require a fixed capacity. New nodes are dynamically allocated as needed.

---

# 30. Linked List Queue vs Array Queue

Add a comparison:

| Feature | Linked List Queue | Array Queue |
|---|---|---|
| Size | Dynamic | Fixed |
| Enqueue | O(1) | O(1) |
| Dequeue | O(1) | O(1) |
| Memory | Dynamic allocation | Pre-allocated |
| Overflow | When memory is unavailable | When array is full |
| Pointers | FRONT and REAR | FRONT and REAR indexes |
| Wasted space | Low | Possible unused positions |

Explain:

A Linked List Queue is useful when the Queue size is not known in advance.

---

# 31. Advantages of Linked List Queue

Create an educational card showing:

- Dynamic size
- No fixed capacity
- Enqueue at REAR is O(1)
- Dequeue at FRONT is O(1)
- No shifting of elements
- Efficient memory allocation based on current size

---

# 32. Disadvantages of Linked List Queue

Create an educational card showing:

- Extra memory is required for `next` pointers.
- Dynamic memory allocation is required.
- Pointer handling makes implementation slightly more complex than an Array.

---

# 33. Animations

Use simple educational animations.

### Enqueue
- New node appears at the REAR.
- `next` connection is animated.
- REAR pointer moves to the new node.

### Dequeue
- FRONT node is highlighted.
- TEMP pointer appears.
- FRONT moves to the next node.
- Old node disappears.

### Peek
- FRONT node is highlighted temporarily.
- No node is removed.

### Clear
- Nodes are removed one by one.
- FRONT and REAR move to NULL.

Animations should be quick and should not interfere with learning.

---

# 34. Error Handling

## Enqueue Without Value

Display:

`Please enter a value.`

## Dequeue When Empty

Display:

`Queue Underflow — Queue is empty.`

## Peek When Empty

Display:

`Queue is Empty.`

The application must never crash.

---

# 35. Responsive Design

The website must work on:

- Desktop
- Laptop
- Tablet
- Mobile

On small screens:

- Nodes remain readable.
- Linked List visualization can scroll horizontally if required.
- Controls wrap properly.
- Code section supports horizontal scrolling.
- Navigation becomes mobile-friendly.

---

# 36. Accessibility

Include:

- Clear button labels
- Keyboard-accessible controls
- Visible focus states
- Readable contrast
- Descriptive operation messages
- Do not rely only on color to indicate FRONT or REAR
- Provide text labels for pointer states

---

# 37. Dark and Light Mode

Provide both modes.

The selected theme should apply to:

- Background
- Cards
- Nodes
- Arrows
- Buttons
- Code section
- Text
- Status messages
- FRONT and REAR indicators

Save the selected theme using `localStorage`.

---

# 38. Data Handling

The Queue should be represented in JavaScript using Linked List nodes.

Conceptually:

```javascript
{
    data: value,
    next: null
}
```

Maintain:

```javascript
let front = null;
let rear = null;
let size = 0;
```

The visualization must always be generated from the current Queue state.

Do not hard-code the visual Queue.

---

# 39. Suggested JavaScript Logic

### Enqueue

```text
create newNode

newNode.next = null

if front == null
    front = rear = newNode
else
    rear.next = newNode
    rear = newNode

size++
```

### Dequeue

```text
if front == null
    Queue Underflow

temp = front
front = front.next

delete temp

if front == null
    rear = null

size--
```

### Peek

```text
front.data
```

### IsEmpty

```text
front == null
```

### Clear

```text
while front != null
    temp = front
    front = front.next
    delete temp

rear = null
size = 0
```

---

# 40. Non-Functional Requirements

### Performance
Operations should update instantly.

### Reliability
The visual Queue state, FRONT, REAR, and node connections must always remain synchronized.

### Simplicity
Explanations should be beginner-friendly.

### Maintainability
HTML, CSS, and JavaScript should be organized clearly.

### Browser Support
Support modern Chrome, Edge, Firefox, and Safari.

---

# 41. Out of Scope

The first version does not require:

- User accounts
- Backend
- Database
- Authentication
- Online code compilation
- Circular Queue
- Priority Queue
- Deque
- Array Queue implementation
- Multiplayer
- Persistent Queue data between sessions

---

# 42. Recommended Page Layout

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
│ Queue ADT — Linked List      Theme Toggle  │
├─────────────────────────────────────────────┤
│ Introduction                                │
│ FIFO explanation                            │
├─────────────────────────────────────────────┤
│ Interactive Visualization                   │
│                                             │
│ Input: [      ]                             │
│ [Enqueue] [Dequeue] [Peek] [Is Empty]       │
│ [Clear]                                     │
│                                             │
│ FRONT                              REAR     │
│   ↓                                  ↓       │
│ [10] → [20] → [30] → NULL            │
├─────────────────────────────────────────────┤
│ Queue Information                           │
│ Size: 3 | FRONT: 10 | REAR: 30             │
├─────────────────────────────────────────────┤
│ Operation History                           │
├─────────────────────────────────────────────┤
│ Step-by-Step Explanation                    │
├─────────────────────────────────────────────┤
│ Pointer Visualization                       │
├─────────────────────────────────────────────┤
│ C++ Implementation                          │
├─────────────────────────────────────────────┤
│ Complexity                                  │
├─────────────────────────────────────────────┤
│ Advantages / Disadvantages                  │
├─────────────────────────────────────────────┤
│ Linked List vs Array                        │
├─────────────────────────────────────────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘
```

---

# 43. Final Product Requirement

Build the website as an **interactive Queue ADT learning tool using a Linked List**, not simply as a theory page.

The most important feature is the live Linked List visualization.

When a student performs:

`Enqueue → Dequeue → Peek → IsEmpty → Clear`

the website must clearly show:

- Nodes
- Data fields
- Next pointers
- FRONT pointer
- REAR pointer
- NULL
- FIFO behavior
- Node creation
- Node deletion
- FRONT movement
- REAR movement
- First Enqueue special case
- Last Dequeue special case

The visualization and C++ implementation should use the same conceptual logic so students can directly connect the visual demonstration with the C++ code.

Keep the entire interface simple, clean, educational, and beginner-friendly.
