import { Func1 }  from "@surface/core";
import Enumerable from "@surface/enumerable";

type Link<T> = { value: T, previous: Link<T> | null, next: Link<T> | null };

export default class LinkedList<T> extends Enumerable<Link<T>>
{
    private _head:   Link<T> | null = null;
    private _length: number         = 0;
    private _tail:   Link<T> | null = null;

    public get head(): Link<T> | null
    {
        return this._head;
    }

    public get length(): number
    {
        return this._length;
    }

    public get tail(): Link<T> | null
    {
        return this._tail;
    }

    public constructor(items?: Iterable<T>)
    {
        super();

        if (items)
        {
            Array.from(items).forEach(this.add.bind(this));
        }
    }

    public *[Symbol.iterator](): Iterator<Link<T>>
    {
        if (this._head)
        {
            yield this._head;

            let node: Link<T> | null = this._head;

            while (node = node?.next)
            {
                yield node;
            }
        }
    }

    public add(value: T): void
    {
        if (this._head && this._tail)
        {
            const link: Link<T> = { value, previous: this._tail, next: null };

            this._tail.next = link;

            this._tail = link;
        }
        else
        {
            const link: Link<T> = { value, previous: null, next: null };

            this._head = link;
            this._tail = link;
        }

        this._length++;
    }

    public remove(value: T): void
    {
        for (const link of this)
        {
            if (Object.is(link.value, value))
            {
                const { previous, next } = link;

                if (previous)
                {
                    previous.next = next;
                }

                if (next)
                {
                    next.previous = previous;
                }

                if (link == this.head)
                {
                    this._tail = this._head = null;
                }
                else if (link == this.tail)
                {
                    this._tail = link.previous;
                }

                link.next     = null;
                link.previous = null;

                this._length--;

            }
        }
    }

    public count(predicate?: Func1<Link<T>, boolean>)
    {
        if (predicate)
        {
            return super.count(predicate);
        }

        return this.length;
    }
}