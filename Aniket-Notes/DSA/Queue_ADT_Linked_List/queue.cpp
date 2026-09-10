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
