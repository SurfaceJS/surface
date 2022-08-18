import type { Delegate } from "@surface/core";
import Enumerable        from "@surface/enumerable";

type Node<T> = { value: T, next?: Node<T> };

export default class Queue<T> extends Enumerable<T>
{
    private _length: number = 0;

    private node:     Node<T> | null = null;
    private lastNode: Node<T> | null = null;

    public get current(): T | null
    {
        return this.node?.value ?? null;
    }

    public get length(): number
    {
        return this._length;
    }

    public constructor(items?: Iterable<T>)
    {
        super();

        if (items)
        {
            Array.from(items).forEach(this.enqueue.bind(this));
        }
    }

    public *[Symbol.iterator](): Iterator<T>
    {
        if (this.node)
        {
            yield this.node.value;

            let node: Node<T> | undefined = this.node;

            while (node = node?.next)
            {
                yield node.value;
            }
        }
    }

    /**
     * Returns the number of elements in a sequence.
     */
    public override count(): number;

    /**
     * Returns a number that represents how many elements in the specified sequence satisfy a condition.
     * @param predicate A function to test each element for a condition.
     */
    public override count(predicate?: Delegate<[T], boolean>): number
    {
        if (predicate)
        {
            return super.count(predicate);
        }

        return this.length;
    }

    public clear(): void
    {
        this.node     = null;
        this.lastNode = null;

        this._length = 0;
    }

    public enqueue(value: T): void
    {
        const node = { value };

        if (this.node)
        {
            this.lastNode!.next = node;
        }
        else
        {
            this.node = node;
        }

        this.lastNode = node;

        this._length++;
    }

    public dequeue(): T | null
    {
        const value = this.node?.value;

        this.node = this.node?.next ?? null;

        this._length--;

        if (this._length == 0)
        {
            this.lastNode = null;
        }

        return value ?? null;
    }
}
