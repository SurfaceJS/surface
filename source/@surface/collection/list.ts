import ArgumentOutOfRangeError from "@surface/core/errors/argument-out-of-range-error";
import Enumerable              from "@surface/enumerable";

const SOURCE = Symbol("list:source");

export default class List<TSource> extends Enumerable<TSource>
{
    [index: number]:  TSource;
    private [SOURCE]: Array<TSource>;

    /** Returns Length of the list. */
    public get length(): number
    {
        return this[SOURCE].length;
    }

    public constructor();
    /**
     * @param elements Iterable<TSource> used to create the list.
     */
    public constructor(elements: Iterable<TSource>);
    public constructor(elements?: Iterable<TSource>)
    {
        super();

        this[SOURCE] = elements ? Array.from(elements) : [];

        const handler: ProxyHandler<List<TSource>> =
        {
            has: (_, key) => Number.isInteger(parseInt(key.toString())) ? key in this[SOURCE] : key in this,
            get: (_, key) =>
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

                    return this[SOURCE][index];
                }
                else
                {
                    return this[key as keyof this];
                }
            },
            set: (_, key, value) =>
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
                    this[key as keyof this] = value;
                }

                return true;
            }
        };

        return new Proxy(this, handler);
    }

    public *[Symbol.iterator](): Iterator<TSource>
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
    public add(item: TSource): void
    {
        this[SOURCE].push(item);
    }

    /**
     * Adds to the list the provided item at specified index.
     * @param item Item to insert.
     * @param index Position from item to insert.
     */
    public addAt(item: TSource, index: number): void;
    /**
     * Adds to the list the provided Array<TSource> object at specified index.
     * @param items Items to insert.
     * @param index Position from items to insert.
     */
    public addAt(items: Array<TSource>, index: number): void;
    /**
     * Adds to the list the provided List<TSource> object at specified index.
     * @param items Items to insert.
     * @param index Position from items to insert.
     */
    public addAt(items: List<TSource>, index: number): void;
    public addAt(itemOrItems: TSource|List<TSource>|Array<TSource>, index: number): void
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
     * Removes from the list the specified item.
     * @param item Item to remove.
     */
    public remove(item: TSource): void;
    /**
     * Removes from the list the item in the specified index.
     * @param index Position from item to remove.
     */
    public remove(index: number): void;
    /**
     * Removes from the list the amount of items specified from the index.
     * @param index Position from item to remove.
     * @param count Quantity of items to remove.
     */
    public remove(index: number, count: number): void;
    public remove(indexOritem: number|TSource, count?: number): void
    {
        if (typeof indexOritem == "number")
        {
            this[SOURCE].splice(indexOritem, count || 1);
        }
        else
        {
            this[SOURCE].splice(this[SOURCE].findIndex(x => Object.is(x, indexOritem)), 1);
        }
    }
}