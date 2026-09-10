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
