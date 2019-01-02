export class LinkedList<T> {
    private _first: Node<T> | undefined;
    private _last: Node<T> | undefined;
    private _size: number;

    constructor(...datas: T[]) {
        if(!datas) {
            this._first = undefined;
            this._last = undefined;
        }

        datas.map((data, index) => {
            this.addLast(data);
        });
        this._size = 0;
    }

    get: ((index: number) => Node<T> | undefined) = (index) => {
        if(this._first && this._size >= index) {
            let temp;
            while(index-- != 0) {
                temp = this._first.next;
            }
            return temp;
        } else {
            console.log("Check: size not zero, index smaller than size");
            return undefined;
        }
    }
    addFirst: ((data: T) => void) = (data) => {
        const newNode = new Node(data);

        if(this._first) {
            newNode.next = this._first;
            this._first = newNode;
            this._size++;
        } else {
            this._first = newNode;
            this._last = newNode;
            this._size++;
        }
    }
    addLast: ((data: T) => void) = (data) => {
        const newNode = new Node(data);

        if(this._last) {
            this._last.next = newNode;
            this._last = newNode;
            this._size++;
        } else {
            this._first = newNode;
            this._last = newNode;
            this._size++;
        }
    }
    add: ((index: number, data: T) => void) = (index, data) => {
        if(index == 0 || !this._first) {
            this.addFirst(data);
        } else {
            const newNode = new Node(data);
            const temp1 = this.get(index-1);
            if(temp1) {
                const temp2 = temp1.next;
                temp1.next = newNode;
                newNode.next = temp2;
            }

            if(!newNode.next) {
                this._last = newNode;
            }

            this._size++;
        }
    }
    removeFirst: (() => T | undefined | undefined) = () => {
        let removedNode = this._first;
        let removedData;
        if(removedNode) {
            removedData = removedNode.data;
            this._first = removedNode.next;
        }
        this._size--;
        removedNode = undefined;

        return removedData;
    }
    removeLast: (() => T | undefined) = () => {
        return this.remove(this._size-1);
    }
    remove: ((index: number) => T | undefined) = (index) => {
        if(index == 0) {
            return this.removeFirst();
        }

        let temp1 = this.get(index-1);
        let temp2;
        let removedNode;
        
        if(temp1 != undefined) {
            let removedNode = temp1.next;
            temp2 = temp1 && temp1.next.next;
        }
        const removedData = removedNode.data;

        temp1.next = temp2;
        removedNode = undefined;
        this._size--;

        if(index == this._size-1) {
            this._last == temp1;
        }

        return removedData;
    }
    indexOf: ((data: T) => number) = (data) => {
        let currentNode = this._first;
        let index = 0;

        while(currentNode.data != data) {
            currentNode = currentNode.next;
            index++;
            
            if(!currentNode) {
                return -1;
            }
        }

        return index;
    }
    getIterator: (() => ListIterator<T>) = () => {
        return new ListIterator(this._first);
    }
    toString: (() => string) = () => {
        let currentNode = this._first;
        let index = 0;
        let result = "[";

        while(currentNode) {
            result += `${index}:${currentNode.data}, `;

            currentNode = currentNode.next;
            index++;
        }

        result = result.substring(0, result.length-2);
        result += "]";
        return '';
    }
}

class Node<T> {
    private _data: T;
    private _next: Node<T> | undefined;

    constructor(data: T) {
        this._data = data;
    }

    get data() {
        return this._data;
    }
    get next() {
        return this._next;
    }
    set data(data: T) {
        this._data = data;
    }
    set next(next: Node<T> | undefined) {
        this._next = next;
    }
    public toString() {
        return this._data.toString();
    }
}

class ListIterator<T> {
    private _currentData: T;
    private _next: Node<T> | undefined;

    constructor(first: Node<T> | undefined) {
        this._next = first;
    }

    next: (() => T | undefined) = () => {
        const currentNode = this._next;
        this._currentData = currentNode.data;
        this._next = currentNode.next;

        return this._currentData;
    }
    hasNext: (() => boolean) = () => {
        if(this._next) return true;
        else return false;
    }
}
