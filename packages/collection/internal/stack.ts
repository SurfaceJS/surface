import type { Delegate } from "@surface/core";
import Enumerable        from "@surface/enumerable";

const SOURCE = Symbol("stack:source");

export default class Stack<T> extends Enumerable<T>
{
    private readonly [SOURCE]: T[] = [];

    public get length(): number
    {
        return this[SOURCE].length;
    }

    public constructor(items?: Iterable<T>)
    {
        super();

        if (items)
        {
            this[SOURCE].push(...items);
        }
    }

    public *[Symbol.iterator](): Iterator<T>
    {
        while (this[SOURCE].length > 0)
        {
            yield this[SOURCE].pop()!;
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
        this[SOURCE].splice(0);
    }

    public push(value: T): void
    {
        this[SOURCE].push(value);
    }

    public pop(): T | undefined
    {
        return this[SOURCE].pop();
    }
}
