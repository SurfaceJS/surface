import { Action2, Func1, Func2, Func3, Nullable } from '@surface/types';

export abstract class Enumerable<TSource> implements Iterable<TSource>
{
    public abstract [Symbol.iterator]: () => Iterator<TSource>;

    /** Determines whether a sequence contains any elements. */
    public any(): boolean;
    /**
     * Determines whether any element of a sequence satisfies a condition.
     * @param predicate A function to test each element for a condition.
     */
    public any(predicate: Func1<TSource, boolean>): boolean;
    public any(predicate?: Func1<TSource, boolean>): boolean
    {
        let hasAny = false;

        let enumerable: Enumerable<TSource> = this;

        if (predicate)
            enumerable = enumerable.where(predicate);
        
        for (let item of enumerable)
        {
            hasAny = item == item;
            break;
        }

        return hasAny;
    }

    /** Casts the elements of an IEnumerable to the specified type. Note that no type checking is performed at runtime. */
    public cast<T extends TSource>(): Enumerable<T>
    {
        return (this as Enumerable<TSource>) as Enumerable<T>;
    }

    /**
     * Returns the elements of the specified sequence or the specified value in a singleton collection if the sequence is empty.
     * @param value The value to return if the sequence is empty.
     */
    public defaultIfEmpty(value: TSource): Enumerable<TSource>
    {
        return new DefaultIfEmptyIterator(this, value);
    }

    /** Returns the first element of a sequence. */
    public first(): TSource;
    /**
     * Returns the first element of the sequence that satisfies a condition.
     * @param predicate A function to test each element for a condition.
     */
    public first(predicate: Func1<TSource, boolean>): TSource;
    public first(predicate?: Func1<TSource, boolean>): TSource
    {
        let value: Nullable<TSource> = null;

        value = predicate && this.firstOrDefault(predicate) || this.firstOrDefault();

        if (!value)
            throw new Error("Value can't be null");

        return value;
    }

    /** Returns the first element of a sequence, or undefined|null if the sequence contains no elements. */
    public firstOrDefault(): Nullable<TSource>;
    /**
     * Returns the first element of the sequence that satisfies a condition or a default value if no such element is found.
     * @param predicate A function to test each element for a condition.
     */
    public firstOrDefault(predicate: Func1<TSource, boolean>): Nullable<TSource>;
    public firstOrDefault(predicate?: Func1<TSource, boolean>): Nullable<TSource>
    {
        if (predicate)
            return this.where(predicate).firstOrDefault();

        return this[Symbol.iterator]().next().value;
    }
    
    /**
     * Performs the specified action on each element of the sequence by incorporating the element's index.
     * @param action The Action2<TSource, number> delegate to perform on each element of the sequence.
     */
    public forEach(action: Action2<TSource, number>)
    {
        let index = 0;
        for (const item of this)
        {
            action(item, index);
            index++;
        }
    }

    /** Returns the last element of a sequence. */
    public last(): TSource;
    /**
     * Returns the last element of the sequence that satisfies a condition.
     * @param predicate A function to test each element for a condition.
     */
    public last(predicate: Func1<TSource, boolean>): TSource;
    public last(predicate?: Func1<TSource, boolean>): TSource
    {
        let value: Nullable<TSource> = null;

        value = predicate && this.lastOrDefault(predicate) || this.lastOrDefault();

        if (!value)
            throw new Error("Value can't be null");

        return value;
    }

    /** Returns the last element of a sequence, or undefined|null if the sequence contains no elements. */
    public lastOrDefault(): Nullable<TSource>;
    /**
     * Returns the last element of the sequence that satisfies a condition or a default value if no such element is found.
     * @param predicate A function to test each element for a condition.
     */
    public lastOrDefault(predicate: Func1<TSource, boolean>): Nullable<TSource>;
    public lastOrDefault(predicate?: Func1<TSource, boolean>): Nullable<TSource>
    {
        if (predicate)
            return this.where(predicate).lastOrDefault();

        let value: Nullable<TSource> = null;

        for (let element of this)
            value = element;
        
        return value;
    }

    /**
     * Projects each element of a sequence into a new form by incorporating the element's index.
     * @param selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
     */
    public select<TResult>(selector: Func2<TSource, number, TResult>): Enumerable<TResult>
    {
        return new SelectIterator<TSource, TResult>(this, selector);
    }

    /**
     * Projects each element of a sequence to an Enumerable<T> and flattens the resulting sequences into one sequence.
     * @param collectionSelector A transform function to apply to each element of the input sequence.
     */
    public selectMany<TResult>(collectionSelector: Func1<TSource, Iterable<TResult>>): Enumerable<TResult>;
    /**
     * 
     * @param collectionSelector A transform function to apply to each element of the input sequence.
     * @param selector           A transform function to apply to each element of the intermediate sequence.
     */
    public selectMany<TCollection, TResult>(collectionSelector: Func1<TSource, Iterable<TCollection>>, selector: Func2<TCollection, number, TResult>): Enumerable<TResult>;
    public selectMany<TCollection, TResult>(collectionSelector: Func1<TSource, Iterable<TCollection>>, selector?: Func2<TCollection, number, TResult>): Enumerable<TResult>
    {
        if (!selector)
            selector = x => x as any;

        return new SelectManyIterator(this, collectionSelector, selector);
    }

    /** Creates an array from a Enumerable<T>. */
    public toArray(): Array<TSource>
    {
        let values: Array<TSource> = [];      

        for (let item of this)
            values.push(item);

        return values;
    }

    /**
     * Filters a sequence of values based on a predicate.
     * @param predicate A function to test each element for a condition.
     */
    public where(predicate: Func1<TSource, boolean>): Enumerable<TSource>
    {
        return new WhereIterator(this, predicate);
    }

    /**
     * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
     * @param second   The second sequence to merge.
     * @param selector A function that specifies how to merge the elements from the two sequences.
     */
    public zip<TSecond, TResult>(second: Iterable<TSecond>, selector: Func3<TSource, TSecond, number, TResult>): Enumerable<TResult>
    {
        return new ZipIterator(this, second, selector);
    }

    /**
     * Create a enumerable object from a iterable source
     * @param source Source used to create the iterable object
     */
    public static from<T>(source: Iterable<T>): Enumerable<T>
    {
        return new EnumerableIterator(source);
    }
}

class EnumerableIterator<TSource> extends Enumerable<TSource>
{
    public [Symbol.iterator]: () => Iterator<TSource>;

    public constructor(source: Iterable<TSource>)
    {
        super();
        this[Symbol.iterator] = function*()
        {
            for (const item of source)
            {
                yield item;
            }
        }
    }
}

class WhereIterator<TSource> extends Enumerable<TSource>
{
    public [Symbol.iterator]: () => Iterator<TSource>;

    public constructor(source: Iterable<TSource>, predicate: Func1<TSource, boolean>)
    {
        super();
        this[Symbol.iterator] = function*()
        {
            for (const item of source)
            {
                if (predicate(item))
                    yield item;
            }
        }
    }
}

class DefaultIfEmptyIterator<TSource> extends Enumerable<TSource>
{
    public [Symbol.iterator]: () => Iterator<TSource>;

    public constructor(source: Iterable<TSource>, defaultValue: TSource)
    {
        super();
        this[Symbol.iterator] = function*()
        {
            let index = 0;
            for (const item of source)
            {
                index++;
                yield item;
            }

            if (index == 0)
                yield defaultValue;
        }        
    }
}

class SelectIterator<TSource, TResult> extends Enumerable<TResult>
{
    public [Symbol.iterator]: () => Iterator<TResult>;

    public constructor(source: Iterable<TSource>, selector: Func2<TSource, number, TResult>)
    {
        super();
        this[Symbol.iterator] = function* ()
        {
            let index = 0;
            for (const item of source)
                yield selector(item, index++);
        }
    }
}

class SelectManyIterator<TSource, TCollection, TResult> extends Enumerable<TResult>
{
    public [Symbol.iterator]: () => Iterator<TResult>;

    public constructor(source: Iterable<TSource>, iterableSelector: Func1<TSource, Iterable<TCollection>>, selector: Func2<TCollection, number, TResult>)
    {
        super();
        this[Symbol.iterator] = function* ()
        {
            let index = 0;
            for (const item of source)
            {
                for (const iteration of iterableSelector(item))
                {
                    yield selector(iteration, index);
                    index++;
                }
            }
        }
    }
}

class ZipIterator<TSource, TCollection, TResult> extends Enumerable<TResult>
{
    public [Symbol.iterator]: () => Iterator<TResult>;

    public constructor(source: Iterable<TSource>, collection: TCollection, selector: Func3<TSource, TCollection, number, TResult>)
    {
        super();
        this[Symbol.iterator] = function* ()
        {
            let index = 0;
            for (const item of source)
            {
                yield selector(item, collection[index], index);
                index++;
            }
        }
    }
}