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

    cout << "--- Step 1: Enqueue 10, 20, 30, 40, 50 ---\n";
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    q.enqueue(40);
    q.enqueue(50);

    cout << "Queue contents: ";
    q.display();

    cout << "\n--- Step 2: Dequeue 2 elements ---\n";
    q.dequeue();
    q.dequeue();

    cout << "\n--- Step 3: Enqueue 60 and 70 (Wrapping around to indices 0 & 1) ---\n";
    q.enqueue(60);
    q.enqueue(70);

    cout << "Queue contents after wrap-around: ";
    q.display();

    return 0;
}
