export abstract class Enumerable<TSource> implements Iterable<TSource>
{
    public abstract [Symbol.iterator]: () => Iterator<any>;
    /**
     * Create a enumerable object from a iterable source
     * @param source Source used to create the iterable object
     */
    public static from<T>(source: Iterable<T>): Enumerable<T>
    {
        return new EnumerableIterator(source);
    }

    /**
     * Filter the enumeration using the specified predicate
     * @param predicate Predicate used to filter the enumeration
     */
    public where(predicate: Func1<TSource, boolean>): Enumerable<TSource>
    {
        return new WhereIterator(this, predicate);
    }
    
    /**
     * Select the enumeration result using the specified selector
     * @param selector Selector used to returns the result, provides a second argument with the index of the iteration
     */
    public select<TResult>(selector: Func2<TSource, number, TResult>): Enumerable<TResult>
    {
        return new SelectIterator<TSource, TResult>(this, selector);
    }

    /**
     * 
     * @param iterableSelector 
     */
    public selectMany<TResult>(iterableSelector: Func1<TSource, Iterable<TResult>>): Enumerable<TResult>;
    /**
     * 
     * @param iterableSelector 
     * @param selector 
     */
    public selectMany<TCollection, TResult>(iterableSelector: Func1<TSource, Iterable<TCollection>>, selector: Func2<TCollection, number, TResult>): Enumerable<TResult>;
    public selectMany<TCollection, TResult>(iterableSelector: Func1<TSource, Iterable<TCollection>>, selector?: Func2<TCollection, number, TResult>): Enumerable<TResult>
    {
        if (!selector)
            selector = x => x as any;

        return new SelectManyIterator(this, iterableSelector, selector);
    }

    /** Return the first item of the enumeration or null */
    public firstOrDefault(): Nullable<TSource>
    {
        return this[Symbol.iterator]().next().value;
    }

    /** Return the first item of the enumeration or throw a exception cause not found */
    public first(): TSource
    {
        let value = this[Symbol.iterator]().next().value;
        if (value)
            return value;
        else
            throw new Error("Value can't be null");
    }

    /**
     * Returns the provided value if the enumeration returns no result
     * @param value Default value to be used
     */
    public defaultIfEmpty(value: TSource): Enumerable<TSource>
    {
        return new DefaultIfEmptyIterator(this, value);
    }

    /** Casts the Enumerable into array */
    public toArray(): Array<TSource>
    {
        let values: Array<TSource> = [];
        let iterator  = this[Symbol.iterator]();
        let iteration = iterator.next();        

        while (!iteration.done)
        {
            values.push(iteration.value);
            iteration = iterator.next();
        }

        return values;
    }
    
    /**
     * Iterates the enumeration by executing the specified action
     * @param action Action to be executed, provides a second argument with the index of the iteration
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

    public zip<TCollection, TResult>(collection: TCollection, selector: Func3<TSource, TCollection, number, TResult>): Enumerable<TResult>
    {
        return new ZipIterator(this, collection, selector);
    }

    /** Convert enumerable to a derived type. Note that no type checking is performed at runtime */
    public cast<T extends TSource>(): Enumerable<T>
    {
        return (this as Enumerable<TSource>) as Enumerable<T>;
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
    public [Symbol.iterator]: () => Iterator<TCollection|TResult>;

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