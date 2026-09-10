# PRD — Queue ADT Using Array Demonstration

## 1. Product Overview

### Product Name
Queue ADT Using Array Visualizer

### Product Type
Interactive educational web application

### Purpose
Create a simple and interactive website that helps students understand how a Queue ADT works when implemented using an Array.

The website should visually demonstrate:
- FIFO (First In, First Out)
- Array-based Queue
- FRONT pointer
- REAR pointer
- Enqueue
- Dequeue
- Peek
- IsEmpty
- IsFull
- Clear
- Step-by-step execution
- C++ implementation
- Time and space complexity

---

## 2. Problem Statement

Students often understand the Queue concept theoretically but find it difficult to visualize how FRONT and REAR change when elements are inserted and removed.

The product will solve this problem by providing an interactive visualization where users can perform Queue operations and immediately see how the Array changes.

---

## 3. Goals

### Primary Goals
1. Explain the Queue ADT in simple language.
2. Demonstrate the FIFO principle visually.
3. Show how a Queue is implemented using an Array.
4. Visualize FRONT and REAR positions.
5. Allow users to perform Queue operations interactively.
6. Explain the corresponding C++ code.
7. Show operation complexity.

### Success Criteria
- A beginner can understand Enqueue and Dequeue after using the visualization.
- Every operation updates the visual Queue correctly.
- FRONT and REAR are clearly visible.
- The array indexes are clearly displayed.
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

Example:

Enqueue:
`10 → 20 → 30`

Queue:

```text
FRONT                         REAR
  ↓                             ↓
┌──────┬──────┬──────┬──────┬──────┐
│  10  │  20  │  30  │      │      │
└──────┴──────┴──────┴──────┴──────┘
   0      1      2      3      4
```

When Dequeue is performed, `10` is removed first.

The Queue is implemented using a fixed-size Array.

---

# 7. Queue Representation

Use a fixed-size array.

Example with size 5:

```text
Index:   0      1      2      3      4
       ┌──────┬──────┬──────┬──────┬──────┐
Array: │  10  │  20  │  30  │      │      │
       └──────┴──────┴──────┴──────┴──────┘
          ↑                    ↑
        FRONT                REAR
```

Initially:

```text
FRONT = -1
REAR  = -1
```

After the first Enqueue:

```text
FRONT = 0
REAR  = 0
```

---

# 8. Functional Requirements

## 8.1 Enqueue Operation

### Description
Add a new element at the REAR of the Queue.

### User Flow
1. User enters a value.
2. User clicks `Enqueue`.
3. Check whether the Queue is full.
4. If the Queue is empty, set FRONT to 0.
5. Increment REAR.
6. Insert the value at REAR.
7. Animate the new element entering the Queue.
8. Update Queue size and operation history.

### Example

Before:

```text
FRONT
 ↓
┌──────┬──────┬──────┬──────┬──────┐
│  10  │  20  │      │      │      │
└──────┴──────┴──────┴──────┴──────┘
          ↑
         REAR
```

Enqueue `30`:

```text
FRONT
 ↓
┌──────┬──────┬──────┬──────┬──────┐
│  10  │  20  │  30  │      │      │
└──────┴──────┴──────┴──────┴──────┘
                 ↑
                REAR
```

### Message
`Enqueued 30 into the queue.`

### Complexity
Time: `O(1)`

---

# 9. Dequeue Operation

### Description
Remove the element from the FRONT of the Queue.

### User Flow
1. User clicks `Dequeue`.
2. Check whether Queue is empty.
3. Store the FRONT value.
4. Move FRONT to the next position.
5. Remove the old FRONT element.
6. Animate the removed element.
7. Update Queue size and operation history.

### Example

Before:

```text
FRONT
 ↓
┌──────┬──────┬──────┬──────┬──────┐
│  10  │  20  │  30  │      │      │
└──────┴──────┴──────┴──────┴──────┘
                 ↑
                REAR
```

After Dequeue:

```text
        FRONT
          ↓
┌──────┬──────┬──────┬──────┬──────┐
│      │  20  │  30  │      │      │
└──────┴──────┴──────┴──────┴──────┘
                 ↑
                REAR
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
Display the element at FRONT without removing it.

### User Flow
1. User clicks `Peek`.
2. Check whether Queue is empty.
3. Highlight FRONT.
4. Display the FRONT value.

### Message
`Front Element: 20`

### Complexity
Time: `O(1)`

---

# 11. IsEmpty Operation

### Description
Check whether the Queue contains any elements.

### Logic

```text
FRONT == -1
```

or, depending on implementation:

```text
FRONT > REAR
```

### Messages

If empty:

`Queue is Empty`

If not empty:

`Queue is Not Empty`

### Complexity
Time: `O(1)`

---

# 12. IsFull Operation

### Description
Check whether the Array Queue has reached its maximum capacity.

For a simple non-circular Queue:

```text
REAR == SIZE - 1
```

### Messages

If full:

`Queue is Full`

Otherwise:

`Queue is Not Full`

### Complexity
Time: `O(1)`

---

# 13. Clear Operation

### Description
Remove all elements from the Queue.

### User Flow
1. User clicks `Clear`.
2. Remove all elements.
3. Reset FRONT to `-1`.
4. Reset REAR to `-1`.
5. Update Queue size.
6. Animate the clearing process.

### Final State

```text
FRONT = -1
REAR  = -1

┌──────┬──────┬──────┬──────┬──────┐
│      │      │      │      │      │
└──────┴──────┴──────┴──────┴──────┘
```

### Message
`Queue cleared successfully.`

---

# 14. User Interface

## 14.1 Header

Display:

**Queue ADT — Array**

Navigation:

- Introduction
- Visualization
- Operations
- C++ Code
- Complexity

Include:

- Light/Dark mode toggle

---

# 15. Introduction Section

Explain:

A Queue is a linear data structure that follows the FIFO principle.

The first element inserted is the first element removed.

Example:

```text
Enqueue 10
Enqueue 20
Enqueue 30

FRONT                         REAR
  ↓                             ↓
┌──────┬──────┬──────┬──────┬──────┐
│  10  │  20  │  30  │      │      │
└──────┴──────┴──────┴──────┴──────┘
```

---

# 16. Interactive Visualization

This is the main section of the website.

Display a fixed-size Array, preferably with 5 or 6 positions.

Example:

```text
              FRONT                         REAR
                ↓                             ↓
Index       0       1       2       3       4
          ┌───────┬───────┬───────┬───────┬───────┐
Array     │  10   │  20   │  30   │       │       │
          └───────┴───────┴───────┴───────┴───────┘
```

Each cell should clearly display:

- Array index
- Stored value
- Empty state

---

# 17. Controls

Provide:

### Input

`Enter value`

### Buttons

- `Enqueue`
- `Dequeue`
- `Peek`
- `Is Empty`
- `Is Full`
- `Clear`
- `Step Mode`
- `Reset`

---

# 18. Enqueue Visualization

When the user enters `40` and clicks Enqueue:

Before:

```text
FRONT                 REAR
  ↓                     ↓
[10] [20] [30] [  ] [  ]
```

After:

```text
FRONT                        REAR
  ↓                            ↓
[10] [20] [30] [40] [  ]
```

Animate the `40` cell.

Display:

`REAR moved from index 2 to index 3.`

---

# 19. Dequeue Visualization

When Dequeue is clicked:

Before:

```text
FRONT                        REAR
  ↓                            ↓
[10] [20] [30] [40] [  ]
```

Highlight `10`.

Then remove it:

```text
        FRONT                  REAR
          ↓                      ↓
[  ] [20] [30] [40] [  ]
```

Display:

`FRONT moved from index 0 to index 1.`

---

# 20. Important Array Queue Behavior

This website should demonstrate that this is a **simple linear Queue using an Array**, not a Circular Queue.

Example:

```text
Initial:

[10] [20] [30] [40] [50]
 ↑                       ↑
FRONT                   REAR
```

After two Dequeue operations:

```text
[  ] [  ] [30] [40] [50]
          ↑             ↑
        FRONT          REAR
```

Even though there are empty positions at the beginning, REAR is already at the end.

A new Enqueue should show:

**Queue Overflow — No space available at REAR.**

This teaches the limitation of a simple linear Array Queue.

---

# 21. FIFO Demonstration

Create a dedicated section:

**FIFO — First In, First Out**

User enters:

```text
10
20
30
40
```

Queue becomes:

```text
FRONT                         REAR
  ↓                             ↓
[10] [20] [30] [40] [  ]
```

Dequeue sequence:

```text
10 → 20 → 30 → 40
```

Clearly explain:

**The first element inserted is the first element removed.**

---

# 22. Step-by-Step Mode

Provide a `Next Step` button.

## Enqueue Steps

### Step 1 — Check Full

```text
REAR < SIZE - 1
```

Show:

`There is space available in the Queue.`

### Step 2 — Check Empty

If this is the first element:

```text
FRONT = 0
```

### Step 3 — Move REAR

```text
REAR = REAR + 1
```

### Step 4 — Insert Value

```text
queue[REAR] = value
```

Final:

```text
FRONT
 ↓
[10] [20] [30] [  ] [  ]
                 ↑
                REAR
```

---

# 23. Dequeue Steps

### Step 1 — Check Empty

```text
FRONT == -1
```

### Step 2 — Read FRONT

```text
value = queue[FRONT]
```

### Step 3 — Move FRONT

```text
FRONT = FRONT + 1
```

### Step 4 — Remove Element

Display the updated Queue.

---

# 24. Queue Information Panel

Display live information:

```text
Queue Size: 3
Capacity: 5
FRONT Index: 0
REAR Index: 2
FRONT Value: 10
REAR Value: 30
Status: Not Empty
```

When empty:

```text
Queue Size: 0
Capacity: 5
FRONT Index: -1
REAR Index: -1
Status: Empty
```

---

# 25. Operation History

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

# 26. C++ Code Section

Display the following simple C++ implementation with syntax highlighting:

```cpp
#include <iostream>
using namespace std;

class Queue {
    int arr[100];
    int front;
    int rear;

public:
    Queue() {
        front = -1;
        rear = -1;
    }

    // Insert element
    void enqueue(int value) {
        if (rear == 99) {
            cout << "Queue Overflow" << endl;
            return;
        }

        if (front == -1)
            front = 0;

        arr[++rear] = value;
    }

    // Remove element
    void dequeue() {
        if (front == -1 || front > rear) {
            cout << "Queue Underflow" << endl;
            return;
        }

        cout << "Deleted: " << arr[front] << endl;
        front++;

        if (front > rear) {
            front = -1;
            rear = -1;
        }
    }

    // Show front element
    void peek() {
        if (front == -1) {
            cout << "Queue is Empty" << endl;
            return;
        }

        cout << "Front: " << arr[front] << endl;
    }

    // Display queue
    void display() {
        if (front == -1) {
            cout << "Queue is Empty" << endl;
            return;
        }

        for (int i = front; i <= rear; i++)
            cout << arr[i] << " ";

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

# 27. Complexity Section

Display:

| Operation | Time Complexity |
|---|---|
| Enqueue | O(1) |
| Dequeue | O(1) |
| Peek | O(1) |
| IsEmpty | O(1) |
| IsFull | O(1) |
| Clear | O(n) |

### Space Complexity

`O(n)`

Where `n` is the size/capacity of the Array.

---

# 28. Array Queue vs Linked List Queue

Add a comparison:

| Feature | Array Queue | Linked List Queue |
|---|---|---|
| Size | Fixed | Dynamic |
| Memory | Pre-allocated | Dynamic allocation |
| Enqueue | O(1) | O(1) |
| Dequeue | O(1) | O(1) |
| Overflow | Array capacity limit | Only when memory is unavailable |
| Memory usage | May contain unused slots | Allocated per node |

Explain:

An Array Queue is simple and easy to implement, but its capacity is fixed.

---

# 29. Linear Queue Limitation

Create a dedicated educational card:

### Problem with Simple Array Queue

When elements are removed from the FRONT:

```text
[  ] [  ] [30] [40] [50]
                  ↑
                 REAR
```

The first two positions are empty, but they cannot be reused in a simple linear Queue.

Therefore, another Enqueue may produce:

`Queue Overflow`

even though empty positions exist at the beginning.

Add a note:

**Circular Queue solves this problem by reusing empty positions.**

Do not implement Circular Queue in this version.

---

# 30. Animations

Use simple educational animations.

### Enqueue
- New value slides into the REAR cell.
- REAR pointer moves.
- Cell is highlighted.

### Dequeue
- FRONT cell is highlighted.
- Element is removed.
- FRONT pointer moves.

### Peek
- FRONT cell is temporarily highlighted.
- No data is removed.

### Clear
- All occupied cells become empty.

Animations should be quick and should not interfere with learning.

---

# 31. Error Handling

## Enqueue Without Value

Display:

`Please enter a value.`

## Enqueue When Full

Display:

`Queue Overflow — Queue is full.`

## Dequeue When Empty

Display:

`Queue Underflow — Queue is empty.`

## Peek When Empty

Display:

`Queue is Empty.`

The application must never crash.

---

# 32. Responsive Design

The website must work on:

- Desktop
- Laptop
- Tablet
- Mobile

On small screens:

- Array cells remain readable.
- Controls wrap properly.
- Code section supports horizontal scrolling.
- Navigation becomes mobile-friendly.

---

# 33. Accessibility

Include:

- Clear button labels
- Keyboard-accessible controls
- Visible focus states
- Readable contrast
- Descriptive operation messages
- Do not rely only on color to indicate FRONT, REAR, or errors

---

# 34. Dark and Light Mode

Provide both modes.

The selected theme should apply to:

- Background
- Cards
- Array cells
- Buttons
- Code section
- Text
- Status messages

Save the selected theme using `localStorage`.

---

# 35. Data Handling

The Queue should be represented in JavaScript using a fixed-size array.

Example:

```javascript
const queue = new Array(5);
let front = -1;
let rear = -1;
```

The visualization must always be generated from the current Queue state.

Do not hard-code the visual Queue.

---

# 36. Suggested JavaScript Logic

### Enqueue

```text
if rear == size - 1
    Queue Overflow

if front == -1
    front = 0

rear++
queue[rear] = value
```

### Dequeue

```text
if front == -1 or front > rear
    Queue Underflow

value = queue[front]
front++

if front > rear
    front = -1
    rear = -1
```

### Peek

```text
queue[front]
```

### IsEmpty

```text
front == -1
```

### IsFull

```text
rear == size - 1
```

---

# 37. Non-Functional Requirements

### Performance
Operations should update instantly.

### Reliability
The visual Queue state, FRONT, and REAR must always remain synchronized.

### Simplicity
Explanations should be beginner-friendly.

### Maintainability
HTML, CSS, and JavaScript should be organized clearly.

### Browser Support
Support modern Chrome, Edge, Firefox, and Safari.

---

# 38. Out of Scope

The first version does not require:

- User accounts
- Backend
- Database
- Authentication
- Online code compilation
- Circular Queue implementation
- Priority Queue
- Deque
- Multiplayer
- Persistent Queue data between sessions

---

# 39. Recommended Page Layout

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
│ Queue ADT — Array           Theme Toggle   │
├─────────────────────────────────────────────┤
│ Introduction                                │
│ FIFO explanation                            │
├─────────────────────────────────────────────┤
│ Interactive Visualization                   │
│                                             │
│ Input: [      ]                             │
│ [Enqueue] [Dequeue] [Peek] [Is Empty]       │
│ [Is Full] [Clear]                           │
│                                             │
│        FRONT                  REAR           │
│          ↓                      ↓            │
│       [10] [20] [30] [  ] [  ]              │
│        0    1    2    3    4                │
├─────────────────────────────────────────────┤
│ Queue Information                           │
│ Size: 3 | FRONT: 0 | REAR: 2               │
├─────────────────────────────────────────────┤
│ Operation History                           │
├─────────────────────────────────────────────┤
│ Step-by-Step Explanation                    │
├─────────────────────────────────────────────┤
│ Linear Queue Limitation                     │
├─────────────────────────────────────────────┤
│ C++ Implementation                          │
├─────────────────────────────────────────────┤
│ Complexity                                  │
├─────────────────────────────────────────────┤
│ Array vs Linked List                        │
├─────────────────────────────────────────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘
```

---

# 40. Final Product Requirement

Build the website as an **interactive Queue ADT learning tool using a simple Array implementation**, not simply as a theory page.

The most important feature is the live Array visualization.

When a student performs:

`Enqueue → Dequeue → Peek → IsEmpty → IsFull → Clear`

the website must clearly show:

- Array indexes
- Stored values
- Empty positions
- FRONT pointer
- REAR pointer
- FIFO behavior
- Queue Overflow
- Queue Underflow
- FRONT movement
- REAR movement
- The limitation of a linear Array Queue

The visualization and C++ implementation should use the same conceptual logic so students can directly connect the visual demonstration with the C++ code.

Keep the entire interface simple, clean, educational, and beginner-friendly.
