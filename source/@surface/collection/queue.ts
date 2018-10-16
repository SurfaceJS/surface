import { Func1, Nullable } from "@surface/core";
import Enumerable          from "@surface/enumerable";

const SOURCE = Symbol("queue:source");

export default class Queue<T> extends Enumerable<T>
{
    private readonly [SOURCE]: Array<T>;

    public constructor(...data: Array<T>)
    {
        super();
        this[SOURCE] = data;
    }

    public *[Symbol.iterator](): Iterator<T>
    {
        while (this[SOURCE].length > 0)
        {
            yield this[SOURCE].pop()!;
        }
    }

    public clear(): void
    {
        this[SOURCE].splice(0, this[SOURCE].length);
    }

    /**
     * Returns the number of elements in a sequence.
     */
    public count(): number;
    /**
     * Returns a number that represents how many elements in the specified sequence satisfy a condition.
     * @param predicate A function to test each element for a condition.
     */
    public count(predicate?: Func1<T, boolean>): number
    {
        if (predicate)
        {
            return this[SOURCE].filter(predicate).length;
        }

        return this[SOURCE].length;
    }

    public dequeue(): Nullable<T>
    {
        return this[SOURCE].pop();
    }

    public enqueue(item: T): void
    {
        this[SOURCE].push(item);
    }
}