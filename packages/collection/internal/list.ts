import type { Delegate }           from "@surface/core";
import { ArgumentOutOfRangeError } from "@surface/core";
import Enumerable                  from "@surface/enumerable";

const SOURCE = Symbol("list:source");

export default class List<T> extends Enumerable<T>
{
    [index: number]:  T;
    private [SOURCE]: T[];

    /** Returns Length of the list. */
    public get length(): number
    {
        return this[SOURCE].length;
    }

    /**
     * @param elements Iterable<T> used to create the list.
     */
    public constructor(elements?: Iterable<T>)
    {
        super();

        this[SOURCE] = elements ? Array.from(elements) : [];

        const handler: ProxyHandler<List<T>> =
        {
            get: (_, key) =>
            {
                const index = Number(key.toString());

                if (Number.isInteger(index))
                {
                    if (index < 0)
                    {
                        throw new ArgumentOutOfRangeError("index is less than 0");
                    }
                    else if (index >= this.length)
                    {
                        throw new ArgumentOutOfRangeError("index is equal to or greater than length");
                    }

                    return this[SOURCE][index];
                }

                return this[key as keyof this];
            },
            has: (_, key) => Number.isInteger(parseInt(key.toString())) ? key in this[SOURCE] : key in this,
            set: (_, key, value: T) =>
            {
                const index = parseInt(key.toString());

                if (Number.isInteger(index))
                {
                    if (index < 0)
                    {
                        throw new ArgumentOutOfRangeError("index is less than 0");
                    }
                    else if (index >= this.length)
                    {
                        throw new ArgumentOutOfRangeError("index is equal to or greater than length");
                    }

                    this[SOURCE][index] = value;
                }
                else
                {
                    this[key as keyof this] = value as this[keyof this];
                }

                return true;
            },
        };

        /* c8 ignore next 2 */ // c8 can't handle constructor return's
        return new Proxy(this, handler);
    }

    public *[Symbol.iterator](): Iterator<T>
    {
        for (const element of this[SOURCE])
        {
            yield element;
        }
    }

    /**
     * Adds provided item to the list.
     * @param item Item to insert.
     */
    public add(item: T): void
    {
        this[SOURCE].push(item);
    }

    /**
     * Adds to the list the provided item at specified index.
     * @param item Item to insert.
     * @param index Position from item to insert.
     */
    public addAt(item: T, index: number): void;

    /**
     * Adds to the list the provided Array<T> object at specified index.
     * @param items Items to insert.
     * @param index Position from items to insert.
     */
    public addAt(items: T[] | List<T>, index: number): void;
    public addAt(itemOrItems: T | List<T> | T[], index: number): void
    {
        const remaining = this[SOURCE].splice(index);

        if (Array.isArray(itemOrItems))
        {
            this[SOURCE] = this[SOURCE].concat(itemOrItems).concat(remaining);
        }
        else if (itemOrItems instanceof List)
        {
            this[SOURCE] = this[SOURCE].concat(itemOrItems.toArray()).concat(remaining);
        }
        else
        {
            this[SOURCE] = this[SOURCE].concat([itemOrItems]).concat(remaining);
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
            return this[SOURCE].filter(predicate).length;
        }

        return this[SOURCE].length;
    }

    /**
     * Removes from the list the specified item.
     * @param item Item to remove.
     */
    public remove(item: T): void;

    /**
     * Removes from the list the item in the specified index.
     * @param index Position from item to remove.
     */
    public remove(index: T): void;

    /**
     * Removes from the list the amount of items specified from the index.
     * @param index Position from item to remove.
     * @param count Quantity of items to remove.
     */
    public remove(index: number, count: number): void;
    public remove(indexOrItem: number | T, count?: number): void
    {
        if (typeof indexOrItem == "number")
        {
            this[SOURCE].splice(indexOrItem, count ?? 1);
        }
        else
        {
            this[SOURCE].splice(this[SOURCE].indexOf(indexOrItem), 1);
        }
    }
}
