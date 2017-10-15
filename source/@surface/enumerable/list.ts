import { Nullable }   from '@surface/types';
import { Enumerable } from '@surface/enumerable';

export class List<TSource> extends Enumerable<TSource>
{
    public [Symbol.iterator]: () => Iterator<TSource>;
    
    private _source: Array<TSource>;
    
    /** Returns Length of the list */
    public get length(): number
    {
        return this._source.length;
    }
    
    public constructor();
    /**
     * @param source Array<TSource> used to create the list
     */
    public constructor(source: Array<TSource>);
    public constructor(source?: Array<TSource>)
    {
        super();
        this._source = source || [];
        let self = this;

        this[Symbol.iterator] = function* ()
        {
            for (const item of self._source)
                yield item;
        }
    }

    /**
     * Adds provided item to the list
     * @param item Item to insert
     */
    public add(item: TSource): void
    {
        this._source.push(item);
    }

    /**
     * Adds to the list the provided item at specified index
     * @param item Item to insert
     * @param index Position from item to insert
     */
    public addAt(item: TSource, index): void;
    /**
     * Adds to the list the provided Array<TSource> object at specified index
     * @param items Items to insert
     * @param index Position from items to insert
     */
    public addAt(items: Array<TSource>, index): void;
    /**
     * Adds to the list the provided List<TSource> object at specified index
     * @param items Items to insert
     * @param index Position from items to insert
     */
    public addAt(items: List<TSource>, index): void;
    public addAt(itemOrItems: TSource|List<TSource>|Array<TSource>, index): void
    {        
        let left = this._source.splice(index + 1)
        if (Array.isArray(itemOrItems))
        {
            let items = itemOrItems;
            this._source = this._source.concat(items).concat(left);
        }
        else if (itemOrItems instanceof List)
        {
            let items = Array.from(itemOrItems);
            this._source = this._source.concat(items).concat(left);
        }
        else
        {
            let item = itemOrItems;
            this._source = this._source.concat([item]).concat(left);
        }
    }

    /**
     * Removes from the list the specified item
     * @param item Item to remove
     */
    public remove(item: TSource): void;
    /**
     * Removes from the list the item in the specified index
     * @param index Position from item to remove
     */
    public remove(index: number): void;
    /**
     * Removes from the list the amount of items specified from the index
     * @param index Position from item to remove
     * @param count Quantity of items to remove
     */
    public remove(index: number, count: number): void;
    public remove(indexOritem: number|TSource, count?: number): void
    {
        let index: number            = 0;
        let item:  Nullable<TSource> = null;
        
        if (typeof indexOritem == "number")
        {
            index = indexOritem;
            this._source.splice(index, count || 1)
        }
        else
        {
            item = indexOritem;
            index = this._source.findIndex(x => Object.is(x, item));
            this._source.splice(index, 1)
        }
    }

    /**
     * Returns the item at the specified index
     * @param index Position of the item
     */
    public item(index: number): TSource
    {
        return this._source[index];
    }
}