import Enumerable from "@surface/enumerable";

const source = Symbol("list:source");

export default class List<TSource> extends Enumerable<TSource>
{
    private [source]: Array<TSource>;

    /** Returns Length of the list. */
    public get length(): number
    {
        return this[source].length;
    }

    public constructor();
    /**
     * @param elements Array<TSource> used to create the list.
     */
    public constructor(elements: Array<TSource>);
    /**
     * @param elements Enumerable<TSource> used to create the list.
     */
    public constructor(elements: Enumerable<TSource>);
    public constructor(elements?: Array<TSource>|Enumerable<TSource>)
    {
        super();
        if (elements && Array.isArray(elements))
        {
            this[source] = elements;
        }
        else if (elements instanceof Enumerable)
        {
            this[source] = elements.toArray();
        }
        else
        {
            this[source] = [];
        }
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        for (const element of this[source])
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
        this[source].push(item);
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
        const remaining = this[source].splice(index);

        if (Array.isArray(itemOrItems))
        {
            this[source] = this[source].concat(itemOrItems).concat(remaining);
        }
        else if (itemOrItems instanceof List)
        {
            this[source] = this[source].concat(itemOrItems.toArray()).concat(remaining);
        }
        else
        {
            this[source] = this[source].concat([itemOrItems]).concat(remaining);
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
            this[source].splice(indexOritem, count || 1);
        }
        else
        {
            this[source].splice(this[source].findIndex(x => Object.is(x, indexOritem)), 1);
        }
    }

    /**
     * Returns the item at the specified index.
     * @param index Position of the item.
     */
    public item(index: number): TSource
    {
        return this[source][index];
    }
}