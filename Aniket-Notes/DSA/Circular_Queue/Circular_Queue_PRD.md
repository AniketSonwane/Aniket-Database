# PRD & DSA Notes — Circular Queue ADT (Array Implementation)

---

## 1. Overview & Concept Summary

### Product / Topic Name
**Circular Queue ADT (Array Implementation with Modulo Arithmetic)**

### What is a Circular Queue?
A **Circular Queue** is an extended variant of the linear Queue Abstract Data Type (ADT) that adheres strictly to the **FIFO (First-In, First-Out)** principle, where the last position of the array is connected back to the first position to form a continuous circle.

In a traditional linear array queue, once elements are dequeued from the front, the memory slots before the `front` pointer become permanently inaccessible even if the array is virtually empty. This issue is called **False Overflow** or **Linear Queue Limitation**.

A Circular Queue solves this limitation completely without shifting elements by using **modulo arithmetic (`% CAPACITY`)**, enabling `front` and `rear` pointers to wrap around to index `0` as soon as they reach the last index (`CAPACITY - 1`).

---

## 2. Problem Statement: Why Do We Need a Circular Queue?

### The Fatal Flaw of Linear Array Queues
Consider a standard linear array queue with Capacity = 5:

```text
Step 1: Enqueue 5 elements (10, 20, 30, 40, 50)
Index:    [ 0 ]   [ 1 ]   [ 2 ]   [ 3 ]   [ 4 ]
Value:    [ 10]   [ 20]   [ 30]   [ 40]   [ 50]
            ↑                               ↑
          front                           rear

Step 2: Dequeue 2 elements (10, 20 removed)
Index:    [ 0 ]   [ 1 ]   [ 2 ]   [ 3 ]   [ 4 ]
Value:    [   ]   [   ]   [ 30]   [ 40]   [ 50]
                            ↑               ↑
                          front           rear

Step 3: Try to Enqueue 60!
Linear condition check: rear == 4 (CAPACITY - 1)
Result: "QUEUE OVERFLOW!" (Cannot insert!)
```

### The Problem
Even though indexes `0` and `1` are completely empty and free, the linear queue reports that it is **FULL** because `rear == 4`. 
This results in **massive memory waste ($O(N)$ unused memory)**.

### The Circular Solution
Instead of incrementing `rear` with `rear++`, we use **circular increment**:
$$\text{rear} = (\text{rear} + 1) \pmod{\text{CAPACITY}}$$

When `rear` is at index `4`:
$$\text{rear} = (4 + 1) \pmod 5 = 5 \pmod 5 = 0$$

`rear` automatically wraps around to index `0` and reuses the empty slot!

---

## 3. Mathematical Foundations of Modulo Arithmetic

The modulo operator (`%`) calculates the remainder after integer division. For any positive integer index $i$ and array capacity $N$:

$$i \pmod N \in \{0, 1, 2, \dots, N-1\}$$

When iterating forward across a circular structure:

| Current Index | Next Sequential (`+1`) | Result $\pmod 5$ | Effect |
| :---: | :---: | :---: | :---: |
| **0** | $0 + 1 = 1$ | $1 \pmod 5 = \mathbf{1}$ | Advances normally |
| **1** | $1 + 1 = 2$ | $2 \pmod 5 = \mathbf{2}$ | Advances normally |
| **2** | $2 + 1 = 3$ | $3 \pmod 5 = \mathbf{3}$ | Advances normally |
| **3** | $3 + 1 = 4$ | $4 \pmod 5 = \mathbf{4}$ | Advances normally |
| **4** (End) | $4 + 1 = 5$ | $5 \pmod 5 = \mathbf{0}$ | **Wraps around to Start!** |

This constant-time formula eliminates any need to shift array elements, preserving true $\mathcal{O}(1)$ performance for both insertion and deletion.

---

## 4. Key Conditions & State Invariants

### 1. Initial Empty State
When the circular queue is first created or when all elements have been removed:
$$\text{front} = -1, \quad \text{rear} = -1$$

### 2. Full Queue Condition
A circular queue is full when advancing `rear` by 1 circular step would collide with `front`:
$$(\text{rear} + 1) \pmod 5 == \text{front}$$

**Why does this condition work?**
- **Case 1 (Standard Linear Full):** `front == 0` and `rear == 4`.
  $$(4 + 1) \pmod 5 = 5 \pmod 5 = 0 == \text{front} \quad (\text{FULL})$$
- **Case 2 (Wrapped Circular Full):** `front == 2` and `rear == 1` (Queue occupies indices 2, 3, 4, 0, 1).
  $$(1 + 1) \pmod 5 = 2 \pmod 5 = 2 == \text{front} \quad (\text{FULL})$$

Both situations are elegantly captured by the single formula:
```cpp
if ((rear + 1) % 5 == front) {
    cout << "Queue is Full\n";
    return;
}
```

### 3. Empty Queue Condition
When no valid elements exist in the queue:
$$\text{front} == -1$$

### 4. Single Element Deletion (Reset Invariant)
When there is only **one element** remaining in the queue, both pointers point to the exact same cell:
$$\text{front} == \text{rear}$$
When this single element is dequeued, the queue becomes completely empty, so we must reset both pointers back to `-1`:
```cpp
if (front == rear) {
    front = rear = -1;
} else {
    front = (front + 1) % 5;
}
```

---

## 5. Step-by-Step Algorithm Breakdown

### Enqueue Operation: `enqueue(value)`
1. **Check Full**: If `(rear + 1) % 5 == front`, print `"Queue is Full"` and abort.
2. **First Element Check**: If `front == -1`, set `front = 0`.
3. **Advance Rear**: Compute `rear = (rear + 1) % 5`.
4. **Store Element**: Assign `arr[rear] = value`.
5. **Success**: Element is successfully enqueued.

### Dequeue Operation: `dequeue()`
1. **Check Empty**: If `front == -1`, print `"Queue is Empty"` and abort.
2. **Read Value**: Record `arr[front]` as the deleted element.
3. **Reset or Advance**:
   - If `front == rear`: The queue is now empty $\implies$ set `front = rear = -1`.
   - Else: Advance front circularly: `front = (front + 1) % 5`.
4. **Success**: Element is successfully dequeued.

### Display Operation: `display()`
1. If `front == -1`, print `"Queue is Empty"` and return.
2. Initialize temporary iterator `i = front`.
3. Enter loop:
   - Print `arr[i]`.
   - If `i == rear`, break out of loop (reached the last enqueued element).
   - Advance iterator circularly: `i = (i + 1) % 5`.

---

## 6. Complete C++ Implementation

```cpp
#include <iostream>
using namespace std;

class CircularQueue {
    int arr[5];
    int front, rear;

public:
    CircularQueue() {
        front = -1;
        rear = -1;
    }

    // Insert element at rear
    void enqueue(int value) {
        if ((rear + 1) % 5 == front) {
            cout << "Queue is Full\n";
            return;
        }

        if (front == -1)
            front = 0;

        rear = (rear + 1) % 5;
        arr[rear] = value;
    }

    // Remove element from front
    void dequeue() {
        if (front == -1) {
            cout << "Queue is Empty\n";
            return;
        }

        cout << "Deleted: " << arr[front] << endl;

        if (front == rear) {
            front = rear = -1;
        } else {
            front = (front + 1) % 5;
        }
    }

    // Display queue elements in logical FIFO order
    void display() {
        if (front == -1) {
            cout << "Queue is Empty\n";
            return;
        }

        int i = front;

        while (true) {
            cout << arr[i] << " ";

            if (i == rear)
                break;

            i = (i + 1) % 5;
        }

        cout << endl;
    }
};

int main() {
    CircularQueue q;

    // Fill the queue
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    q.enqueue(40);
    q.enqueue(50);

    cout << "Queue after 5 enqueues: ";
    q.display();

    // Dequeue twice to free indexes 0 and 1
    q.dequeue();
    q.dequeue();

    // Enqueue new elements that wrap around to indices 0 & 1
    q.enqueue(60);
    q.enqueue(70);

    cout << "Queue after wrapping enqueue(60) & enqueue(70): ";
    q.display();

    return 0;
}
```

---

## 7. Detailed Execution Walkthrough of `main()`

| Step | Operation | `front` | `rear` | Array Contents `[0, 1, 2, 3, 4]` | Explanation |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **0** | `Init` | `-1` | `-1` | `[ _,  _,  _,  _,  _ ]` | Queue initialized empty. |
| **1** | `enqueue(10)` | `0` | `0` | `[ 10,  _,  _,  _,  _ ]` | `front` set to 0. `rear = (0+0)%5 = 0`. |
| **2** | `enqueue(20)` | `0` | `1` | `[ 10, 20,  _,  _,  _ ]` | `rear = (0+1)%5 = 1`. |
| **3** | `enqueue(30)` | `0` | `2` | `[ 10, 20, 30,  _,  _ ]` | `rear = (1+1)%5 = 2`. |
| **4** | `enqueue(40)` | `0` | `3` | `[ 10, 20, 30, 40,  _ ]` | `rear = (2+1)%5 = 3`. |
| **5** | `enqueue(50)` | `0` | `4` | `[ 10, 20, 30, 40, 50 ]` | `rear = (3+1)%5 = 4`. **Queue is now FULL!** |
| **6** | `dequeue()` | `1` | `4` | `[  _, 20, 30, 40, 50 ]` | 10 deleted. `front = (0+1)%5 = 1`. Index 0 freed! |
| **7** | `dequeue()` | `2` | `4` | `[  _,  _, 30, 40, 50 ]` | 20 deleted. `front = (1+1)%5 = 2`. Index 1 freed! |
| **8** | `enqueue(60)` | `2` | **0** | `[ 60,  _, 30, 40, 50 ]` | **WRAP-AROUND!** `rear = (4+1)%5 = 0`. Value 60 stored at index 0! |
| **9** | `enqueue(70)` | `2` | **1** | `[ 60, 70, 30, 40, 50 ]` | `rear = (0+1)%5 = 1`. Value 70 stored at index 1! **Queue FULL again!** |
| **10**| `display()` | `2` | `1` | Order: `30 40 50 60 70` | Iterates: `2 → 3 → 4 → 0 → 1`. Prints exact FIFO order! |

---

## 8. Complexity Analysis

### Time Complexity

| Operation | Time Complexity | Justification |
| :--- | :---: | :--- |
| **`enqueue(val)`** | $\mathcal{O}(1)$ | Constant arithmetic `(rear + 1) % 5` and direct array indexing. |
| **`dequeue()`** | $\mathcal{O}(1)$ | Constant arithmetic `(front + 1) % 5` and direct array access. |
| **`peek()` / Front** | $\mathcal{O}(1)$ | Direct lookup of `arr[front]`. |
| **`isEmpty()`** | $\mathcal{O}(1)$ | Single integer check `front == -1`. |
| **`isFull()`** | $\mathcal{O}(1)$ | Single modulo arithmetic test `(rear + 1) % 5 == front`. |
| **`display()`** | $\mathcal{O}(K)$ | Linear traversal of the $K$ currently occupied elements. |

### Space Complexity
- **Auxiliary Space:** $\mathcal{O}(1)$ — No dynamic memory allocation or resizing.
- **Total Memory:** $\mathcal{O}(N)$ — Pre-allocated static array of size $N = 5$.

---

## 9. Comprehensive Comparison Matrix

| Feature | Linear Array Queue | Circular Array Queue | Linked List Queue |
| :--- | :--- | :--- | :--- |
| **Memory Reuse** | ❌ No (Slots before `front` wasted) | ✅ **Yes (Modulo wraps to index 0)** | ✅ Dynamic allocation |
| **False Overflow** | ⚠️ High (When `rear == N-1`) | 🛡️ **None (Only when truly full)** | 🛡️ None |
| **Enqueue Complexity** | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |
| **Dequeue Complexity** | $\mathcal{O}(1)$ (or $\mathcal{O}(N)$ if shifting) | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |
| **Memory Allocation** | Static / Fixed | Static / Fixed | Dynamic per node |
| **Pointer Overhead** | 2 integers (`front, rear`) | 2 integers (`front, rear`) | 1 or 2 pointers per node + heap metadata |
| **Cache Locality** | Excellent | Excellent (Contiguous array) | Poor (Dispersed nodes) |

---

## 10. Real-World Applications

1. **CPU Process Scheduling (Round-Robin):** In operating systems, time-shared scheduling cycles through processes in a fixed circular queue, returning pre-empted processes back to the tail.
2. **I/O & Hardware Buffers (Ring Buffers):** Keyboard buffers, UART serial controllers, and disk controllers use fixed circular queues where new bytes overwrite or wait for consumer interrupts.
3. **Multimedia Streaming & Audio Buffers:** Audio playback engines use circular buffers to continuously receive audio packets and stream them to DAC hardware without jitter.
4. **Traffic Light Controllers:** Electronic traffic controllers cycle through green lights in fixed circular sequence $(N \pmod 4)$.

---

## 11. Frequently Asked Viva & Interview Questions

### Q1: What is the main advantage of a Circular Queue over a Linear Queue?
**Answer:** A Circular Queue eliminates memory wastage and false overflow. In a linear queue, when elements are dequeued, the space before `front` cannot be reused. In a circular queue, modulo arithmetic wraps pointers back to index 0, fully utilizing every array slot.

### Q2: Why is the full condition `(rear + 1) % SIZE == front`?
**Answer:** Because advancing `rear` circularly by 1 position brings it to the exact index occupied by `front`. If we allowed another insertion, `rear` would overwrite the oldest unread element.

### Q3: What happens during `dequeue()` when `front == rear`?
**Answer:** When `front == rear`, exactly one element remains in the queue. Dequeuing it leaves the queue empty, so both pointers must be reset to `-1`.

### Q4: Can a Circular Queue be implemented using a Linked List?
**Answer:** Yes, by having the `next` pointer of the last node point directly back to the head node instead of `NULL` (a Circular Linked List).
