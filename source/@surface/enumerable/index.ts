import { Action2, Func1, Func2, Func3, Nullable } from "@surface/core";
import IComparer                                  from "./interfaces/comparer";
import IGroup                                     from "./interfaces/group";
import ILookup                                    from "./interfaces/lookup";
import Comparer                                   from "./internal/comparer";
import EnumerableSorter                           from "./internal/enumerable-sorter";
import Lookup                                     from "./internal/lookup";
import Set                                        from "./internal/set";

export abstract class Enumerable<TSource> implements Iterable<TSource>
{
    public static empty<TSource>(): Enumerable<TSource>
    {
        return new EnumerableIterator([] as Array<TSource>);
    }

    /**
     * Create a enumerable object from a iterable source
     * @param source Source used to create the iterable object
     */
    public static from<TSource>(source: Iterable<TSource>): Enumerable<TSource>
    {
        return new EnumerableIterator(source);
    }

    /**
     * Generates a sequence of integral numbers within a specified range.
     * @param start The value of the first integer in the sequence.
     * @param end   The value of the last integer in the sequence.
     */
    public static range(start: number, end: number): Enumerable<number>
    {
        if (start > end)
        {
            throw new TypeError("start cannot be greater than end");
        }

        return new RangeIterator(start, end);
    }

    /**
     * Generates a sequence that contains one repeated value.
     * @param value The value to be repeated.
     * @param count The number of times to repeat the value in the generated sequence.
     */
    public static repeat<TSource>(value: TSource, count: number): Enumerable<TSource>
    {
        return new RepeatIterator(value, count);
    }

    protected next(): Nullable<TSource>
    {
        const value = this[Symbol.iterator]().next().value;

        return value != undefined && value != null ? value : null;
    }

    public abstract [Symbol.iterator](): Iterator<TSource>;

    /**
     * Applies an accumulator function over a sequence.
     * @param acumulator An accumulator function to be invoked on each element.
     */
    public aggregate(acumulator: Func2<TSource, TSource, TSource>): TSource;
    /**
     * Applies an accumulator function over a sequence.
     * @param acumulator An accumulator function to be invoked on each element.
     * @param seed       The initial accumulator value.
     */
    public aggregate(acumulator: Func2<TSource, TSource, TSource>, seed: TSource): TSource;
    public aggregate(acumulator: Func2<TSource, TSource, TSource>, seed?: TSource): TSource
    {
        let acumulatted = seed;

        for (const element of this)
        {
            if (acumulatted)
            {
                acumulatted = acumulator(acumulatted, element);
            }
            else
            {
                acumulatted = element;
            }
        }

        return acumulatted as TSource;
    }

    /**
     * Determines whether all elements of a sequence satisfy a condition.
     * @param predicate A function to test each element for a condition.
     */
    public all(predicate: Func1<TSource, boolean>): boolean
    {
        for (const element of this)
        {
            if (!predicate(element))
            {
                return false;
            }
        }

        return true;
    }

    /** Determines whether a sequence contains any elements. */
    public any(): boolean;
    /**
     * Determines whether any element of a sequence satisfies a condition.
     * @param predicate A function to test each element for a condition.
     */
    public any(predicate: Func1<TSource, boolean>): boolean;
    public any(predicate?: Func1<TSource, boolean>): boolean
    {
        if (predicate)
        {
            return this.where(predicate).any();
        }

        for (const element of this)
        {
            return element == element;
        }

        return false;
    }

    /**
     * Computes the average of a sequence of numeric values.
     */
    public average(): TSource extends number ? number : void;
    /**
     * Computes the average of a sequence of numeric values.
     * @param selector A transform function to apply to each element.
     */
    public average(selector: Func1<TSource, number>): number;
    public average(selector?: Func1<TSource, number>): number|void
    {
        if (selector)
        {
            return this.select(selector).average();
        }

        let current = 0;
        let count   = 0;

        for (const element of this)
        {
            if (!(typeof element == "number"))
            {
                throw new TypeError("element is not a number");
            }

            current += element;
            count++;
        }

        if (count > 0)
        {
            return current / count;
        }

        return 0;
    }

    /** Casts the elements of an IEnumerable to the specified type. Note that no type checking is performed at runtime. */
    public cast<T extends TSource>(): Enumerable<T>
    {
        return this as Object as Enumerable<T>;
    }

    /**
     * Concatenate two sequences.
     * @param sequence The sequence to concatenate to the first sequence.
     */
    public concat(sequence: Iterable<TSource>): Enumerable<TSource>
    {
        return new ConcatIterator(this, sequence);
    }

    /**
     * Determines whether a sequence contains a specified element by using the default equality comparer.
     * @param value The value to locate in the sequence.
     */
    public contains(value: TSource): boolean;
    /**
     * Determines whether a sequence contains a specified element by using a specified IComparer<T>.
     * @param value    The value to locate in the sequence.
     * @param comparer An IComparer<T> to compare values.
     */
    public contains(value: TSource, comparer: IComparer<TSource>): boolean;
    public contains(value: TSource, comparer?: IComparer<TSource>): boolean
    {
        for (const element of this)
        {
            if ((comparer || new Comparer()).equals(element, value))
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns the number of elements in a sequence.
     */
    public count(): number;
    /**
     * Returns a number that represents how many elements in the specified sequence satisfy a condition.
     * @param predicate A function to test each element for a condition.
     */
    public count(predicate: Func1<TSource, boolean>): number;
    public count(predicate?: Func1<TSource, boolean>): number
    {
        if (predicate)
        {
            return this.where(predicate).count();
        }

        let count = 0;

        this.forEach(() => count++);

        return count;
    }

    /**
     * Returns the elements of the specified sequence or the specified value in a singleton collection if the sequence is empty.
     * @param value The value to return if the sequence is empty.
     */
    public defaultIfEmpty(value: TSource): Enumerable<TSource>
    {
        return new DefaultIfEmptyIterator(this, value);
    }

    /**
     * Returns distinct elements from a sequence by using the default equality comparer to compare values.
     */
    public distinct(): Enumerable<TSource>;
    /**
     * Returns distinct elements from a sequence by using the default equality comparer to compare values.
     * @param comparer An IComparer<T> to compare values.
     */
    public distinct(comparer: IComparer<TSource>): Enumerable<TSource>;
    public distinct(comparer?: IComparer<TSource>): Enumerable<TSource>
    {
        return new DistinctIterator(this, comparer || new Comparer());
    }

    /**
     * Returns the element at a specified index in a sequence.
     * @param index The zero-based index of the element to retrieve.
     */
    public elementAt(index: number): TSource
    {
        let element = this.elementAtOrDefault(index);

        if (!element)
        {
            throw new Error("index is less than 0 or greater than the number of elements in source");
        }

        return element;
    }

    /**
     * Returns the element at a specified index in a sequence or or undefined|null value if the index is out of range.
     * @param index The zero-based index of the element to retrieve.
     */
    public elementAtOrDefault(index: number): Nullable<TSource>
    {
        let currentIndex = 0;
        let current: Nullable<TSource> = null;

        for (const element of this)
        {
            if (currentIndex == index)
            {
                current = element;
                break;
            }

            currentIndex++;
        }

        return current;
    }

    /**
     * Produces the set difference of two sequences by using the default equality comparer to compare values.
     * @param second An Enumerable<T> whose elements that also occur in the first sequence will cause those elements to be removed from the returned sequence.
     */
    public except(second: Iterable<TSource>): Enumerable<TSource>;
    /**
     * Produces the set difference of two sequences by using the default equality comparer to compare values.
     * @param second   An Enumerable<T> whose elements that also occur in the first sequence will cause those elements to be removed from the returned sequence.
     * @param comparer An IComparer<T> to compare values.
     */
    public except(second: Iterable<TSource>, comparer: IComparer<TSource>): Enumerable<TSource>;
    public except(second: Iterable<TSource>, comparer?: IComparer<TSource>): Enumerable<TSource>
    {
        return new ExceptIterator(this, second, comparer || new Comparer());
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
        const element = predicate ? this.firstOrDefault(predicate) : this.firstOrDefault();

        if (!element && predicate)
        {
            throw new Error("no element satisfies the condition in predicate");
        }
        else if (!element)
        {
            throw new Error("the source sequence is empty");
        }

        return element;
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
        {
            return this.where(predicate).next();
        }

        return this.next();
    }

    /**
     * Performs the specified action on each element of the sequence by incorporating the element"s index.
     * @param action The Action2<TSource, number> delegate to perform on each element of the sequence.
     */
    public forEach(action: Action2<TSource, number>): void
    {
        let index = 0;
        for (const element of this)
        {
            action(element, index);
            index++;
        }
    }

    /**
     * Return all elements when there is a match in either outter or inner sequence.
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     */
    public fullJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<Nullable<TSource>, Nullable<TInner>, TResult>): Enumerable<TResult>;
    /**
     * Return all elements when there is a match in either outter or inner sequence. A specified IComparer<T> is used to compare keys.
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     * @param comparer          An IComparer<T> to hash and compare keys.
     */
    public fullJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<Nullable<TSource>, Nullable<TInner>, TResult>, comparer: IComparer<TKey>): Enumerable<TResult>;
    public fullJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<Nullable<TSource>, Nullable<TInner>, TResult>, comparer?: IComparer<TKey>): Enumerable<TResult>
    {
        return new FullJoinIterator(this, inner, outterKeySelector, innerKeySelector, resultSelector, comparer || new Comparer());
    }

    /**
     * Groups the elements of a sequence according to a specified key selector function and creates a result value from each group and its key.
     * @param keySelector     A function to extract the key for each element.
     */
    public groupBy<TKey>(keySelector: Func1<TSource, TKey>): Enumerable<IGroup<TSource, TKey>>;
    /**
     * Groups the elements of a sequence according to a specified key selector function and creates a result value from each group and its key and the elements of each group are projected by using a specified element selector function.
     * @param keySelector     A function to extract the key for each element.
     * @param elementSelector A function to map each source element to an element in an IGroup<TKey, TElement>.
     */
    public groupBy<TKey, TElement>(keySelector: Func1<TSource, TKey>, elementSelector: Func1<TSource, TElement>): Enumerable<IGroup<TElement, TKey>>;
    /**
     * Groups the elements of a sequence according to a specified key selector function and creates a result value from each group using a specified result selector. The elements of each group are projected by using a specified element selector function.
     * @param keySelector     A function to extract the key for each element.
     * @param elementSelector A function to map each source element to an element in an IGroup<TKey, TElement>.
     * @param resultSelector  A function to create a result value from each group.
     */
    public groupBy<TKey, TElement, TResult>(keySelector: Func1<TSource, TKey>, elementSelector: Func1<TSource, TElement>, resultSelector: Func2<TKey, Iterable<TElement>, TResult>): Enumerable<TResult>;
    /**
     * Groups the elements of a sequence according to a specified key selector function and creates a result value from each group using a specified result selector. Key values are compared by using a specified comparer and the elements of each group are projected by using a specified element selector function.
     * @param keySelector     A function to extract the key for each element.
     * @param elementSelector A function to map each source element to an element in an IGroup<TKey, TElement>.
     * @param resultSelector  A function to create a result value from each group.
     * @param comparer        An IComparer<T> to hash and compare keys.
     */
    public groupBy<TKey, TElement, TResult>(keySelector: Func1<TSource, TKey>, elementSelector: Func1<TSource, TElement>, resultSelector: Func2<TKey, Iterable<TElement>, TResult>, comparer: IComparer<TKey>): Enumerable<TResult>;
    public groupBy<TKey, TElement, TResult>(keySelector: Func1<TSource, TKey>, elementSelector?: Func1<TSource, TElement>, resultSelector?: Func2<TKey, Iterable<TElement>, TResult>, comparer?: IComparer<TKey>): Enumerable<TResult>
    {
        elementSelector = elementSelector || (x => x as Object as TElement);
        resultSelector  = resultSelector  || ((key, elements) => ({ key, elements }) as Object as TResult);

        return new GroupByIterator(this, keySelector, elementSelector, resultSelector, comparer || new Comparer());
    }

    /**
     * Correlates the elements of two sequences based on matching keys and groups the results..
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     */
    public groupJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TSource, Iterable<TInner>, TResult>): Enumerable<TResult>;
    /**
     * Correlates the elements of two sequences based on matching keys and groups the results. A specified IComparer<T> is used to compare keys.
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     * @param comparer          An IComparer<T> to hash and compare keys.
     */
    public groupJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TSource, Iterable<TInner>, TResult>, comparer: IComparer<TKey>): Enumerable<TResult>;
    public groupJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TSource, Iterable<TInner>, TResult>, comparer?: IComparer<TKey>): Enumerable<TResult>
    {
        return new GroupJoinIterator(this, inner, outterKeySelector, innerKeySelector, resultSelector, comparer || new Comparer());
    }

    /**
     * Produces the set intersection of two sequences.
     * @param second An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     */
    public intersect(second: Iterable<TSource>): Enumerable<TSource>;
    /**
     * Produces the set intersection of two sequences by using the specified IComparer<T> to compare values.
     * @param second   An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     * @param comparer An IComparer<T> to hash and compare keys.
     */
    public intersect(second: Iterable<TSource>, comparer: IComparer<TSource>): Enumerable<TSource>;
    public intersect(second: Iterable<TSource>, comparer?: IComparer<TSource>): Enumerable<TSource>
    {
        return new JoinIterator(this, second, x => x, x => x, (inner, outter) => inner, comparer || new Comparer());
    }

    /**
     * Correlates the elements of two sequences based on matching keys.
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     */
    public join<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TSource, TInner, TResult>): Enumerable<TResult>;
    /**
     * Correlates the elements of two sequences based on matching keys. A specified IComparer<T> is used to compare keys.
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     * @param comparer          An IComparer<T> to hash and compare keys.
     */
    public join<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TSource, TInner, TResult>, comparer: IComparer<TKey>): Enumerable<TResult>;
    public join<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TSource, TInner, TResult>, comparer?: IComparer<TKey>): Enumerable<TResult>
    {
        return new JoinIterator(this, inner, outterKeySelector, innerKeySelector, resultSelector, comparer || new Comparer());
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
        let element: Nullable<TSource> = null;

        element = predicate ? this.lastOrDefault(predicate) : this.lastOrDefault();

        if (!element && predicate)
        {
            throw new Error("no element satisfies the condition in predicate");
        }
        else if (!element)
        {
            throw new Error("the source sequence is empty");
        }

        return element;
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
        {
            return this.where(predicate).lastOrDefault();
        }

        let current: Nullable<TSource> = null;

        for (const element of this)
        {
            current = element;
        }

        return current;
    }

    /**
     * returns all elements from the inner sequence, and the matched records from the outter sequence. The result is null from the outter element, when there is no match.
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     */
    public leftJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TSource, Nullable<TInner>, TResult>): Enumerable<TResult>;
    /**
     * returns all elements from the inner sequence, and the matched records from the outter sequence. The result is null from the outter element, when there is no match. A specified IComparer<T> is used to compare keys.
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     * @param comparer          An IComparer<T> to hash and compare keys.
     */
    public leftJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TSource, Nullable<TInner>, TResult>, comparer: IComparer<TKey>): Enumerable<TResult>;
    public leftJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TSource, Nullable<TInner>, TResult>, comparer?: IComparer<TKey>): Enumerable<TResult>
    {
        return new LeftJoinIterator(this, inner, outterKeySelector, innerKeySelector, resultSelector, comparer || new Comparer());
    }

    /**
     * Computes the max of a sequence of numeric values.
     */
    public max(): TSource extends number ? number : void;
    /**
     * Computes the max of a sequence of numeric values.
     * @param selector A transform function to apply to each element.
     */
    public max(selector: Func1<TSource, number>): number;
    public max(selector?: Func1<TSource, number>): number|void
    {
        if (selector)
        {
            return this.select(selector).max();
        }

        let max: Nullable<number> = null;

        for (const element of this)
        {
            if (!(typeof element == "number"))
            {
                throw new TypeError("element is not a number");
            }

            if (!max)
            {
                max = element;
            }
            else if (element > max)
            {
                max = element;
            }
        }

        return max || 0;
    }

    /**
     * Computes the min of a sequence of numeric values.
     */
    public min(): TSource extends number ? number : void;
    /**
     * Computes the min of a sequence of numeric values.
     * @param selector A transform function to apply to each element.
     */
    public min(selector: Func1<TSource, number>): number;
    public min(selector?: Func1<TSource, number>): number|void
    {
        if (selector)
        {
            return this.select(selector).min();
        }

        let min = 0;

        for (const element of this)
        {
            if (!(typeof element == "number"))
            {
                throw new TypeError("element is not a number");
            }

            if (!min)
            {
                min = element;
            }
            else if (element < min)
            {
                min = element;
            }
        }

        return min || 0;
    }

    /**
     * Sorts the elements of a sequence in ascending order by using a specified comparer.
     * @param keySelector A function to extract a key from an element.
     */
    public orderBy<TKey>(keySelector: Func1<TSource, TKey>): OrderedEnumerable<TSource>;
    /**
     * Sorts the elements of a sequence in ascending order by using a specified comparer.
     * @param keySelector A function to extract a key from an element.
     * @param comparer    A function to compare keys.
     */
    public orderBy<TKey>(keySelector: Func1<TSource, TKey>, comparer: IComparer<TKey>): OrderedEnumerable<TSource>;
    public orderBy<TKey>(keySelector: Func1<TSource, TKey>, comparer?: IComparer<TKey>): OrderedEnumerable<TSource>
    {
        return new OrderByIterator(this, keySelector, false, comparer || new Comparer());
    }

    /**
     * Sorts the elements of a sequence in descending order by using a specified comparer.
     * @param keySelector A function to extract a key from an element.
     */
    public orderByDescending<TKey>(keySelector: Func1<TSource, TKey>): OrderedEnumerable<TSource>;
    /**
     * Sorts the elements of a sequence in descending order by using a specified comparer.
     * @param keySelector A function to extract a key from an element.
     * @param comparer    A function to compare keys.
     */
    public orderByDescending<TKey>(keySelector: Func1<TSource, TKey>, comparer: IComparer<TKey>): OrderedEnumerable<TSource>;
    public orderByDescending<TKey>(keySelector: Func1<TSource, TKey>, comparer?: IComparer<TKey>): OrderedEnumerable<TSource>
    {
        return new OrderByIterator(this, keySelector, true, comparer || new Comparer());
    }

    /**
     * Adds a value to the beginning of the sequence.
     * @param element The value to prepend to source.
     */
    public prepend(element: TSource): Enumerable<TSource>
    {
        return new PrependIterator(this, element);
    }

    /** Inverts the order of the elements in a sequence. */
    public reverse(): Enumerable<TSource>
    {
        return Enumerable.from(this.toArray().reverse());
    }

    /**
     * returns all elements from the inner sequence, and the matched records from the outter sequence. The result is null from the outter element, when there is no match.
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     */
    public rightJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<Nullable<TSource>, TInner, TResult>): Enumerable<TResult>;
    /**
     * returns all elements from the inner sequence, and the matched records from the outter sequence. The result is null from the outter element, when there is no match. A specified IComparer<T> is used to compare keys.
     * @param inner             The sequence to join to the source sequence.
     * @param outterKeySelector A function to extract the join key from each element of the source sequence.
     * @param innerKeySelector  A function to extract the join key from each element of the second sequence.
     * @param resultSelector    A function to create a result element from two matching elements.
     * @param comparer          An IComparer<T> to hash and compare keys.
     */
    public rightJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<Nullable<TSource>, TInner, TResult>, comparer: IComparer<TKey>): Enumerable<TResult>;
    public rightJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outterKeySelector: Func1<TSource, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<Nullable<TSource>, TInner, TResult>, comparer?: IComparer<TKey>): Enumerable<TResult>
    {
        return new RightJoinIterator(this, inner, outterKeySelector, innerKeySelector, resultSelector, comparer || new Comparer());
    }

    /**
     * Projects each element of a sequence into a new form by incorporating the element"s index.
     * @param collectionSelector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
     */
    public select<TResult>(collectionSelector: Func2<TSource, number, TResult>): Enumerable<TResult>
    {
        return new SelectIterator<TSource, TResult>(this, collectionSelector);
    }

    /**
     * Projects each element of a sequence to an Enumerable<T> and flattens the resulting sequences into one sequence.
     * @param collectionSelector A transform function to apply to each element of the input sequence.
     */
    public selectMany<TResult>(collectionSelector: Func1<TSource, Iterable<TResult>>): Enumerable<TResult>;
    /**
     *
     * @param collectionSelector A transform function to apply to each element of the input sequence.
     * @param resultSelector     A transform function to apply to each element of the intermediate sequence.
     */
    public selectMany<TCollection, TResult>(collectionSelector: Func1<TSource, Iterable<TCollection>>, resultSelector:  Func3<TSource, TCollection, number, TResult>): Enumerable<TResult>;
    public selectMany<TCollection, TResult>(collectionSelector: Func1<TSource, Iterable<TCollection>>, resultSelector?: Func3<TSource, TCollection, number, TResult>): Enumerable<TResult>
    {
        if (!resultSelector)
        {
            resultSelector = (x, y) => y as Object as TResult;
        }

        return new SelectManyIterator(this, collectionSelector, resultSelector);
    }

    /**
     * Determines whether two sequences are equal by comparing their elements by using a specified IComparer<T>.
     * @param second An Enumerable<T> to compare to the first sequence.
     */
    public sequenceEqual(second: Enumerable<TSource>): boolean;
    /**
     * Determines whether two sequences are equal by comparing their elements by using a specified IComparer<T>.
     * @param second   An Enumerable<T> to compare to the first sequence.
     * @param comparer An IComparer<T> to hash and compare keys.
     */
    public sequenceEqual(second: Enumerable<TSource>, comparer: IComparer<Nullable<TSource>>): boolean;
    public sequenceEqual(second: Enumerable<TSource>, comparer?: IComparer<Nullable<TSource>>): boolean
    {
        return this.fullJoin(second, x => x, x => x, (outter, inner) => ({ outter, inner })).all(x => (comparer || new Comparer()).equals(x.inner, x.outter));
    }

    /**
     * Returns the only element of a sequence, and throws an exception if there is not exactly one element in the sequence.
     */
    public single(): TSource;
    /**
     * Returns the only element of a sequence that satisfies a specified condition, and throws an exception if more than one such element exists.
     * @param predicate function to test an element for a condition.
     */
    public single(predicate: Func1<TSource, boolean>): TSource;
    public single(predicate?: Func1<TSource, boolean>): TSource
    {
        const element = predicate ? this.singleOrDefault(predicate) : this.singleOrDefault();

        if (!element && predicate)
        {
            throw new Error("no element satisfies the condition in predicate");
        }
        else if (!element)
        {
            throw new Error("the source sequence is empty");
        }

        return element;
    }

    /**
     * Returns the only element of a sequence, and throws an exception if there is not exactly one element in the sequence.
     */
    public singleOrDefault(): Nullable<TSource>;
    /**
     * Returns the only element of a sequence that satisfies a specified condition, and throws an exception if more than one such element exists.
     * @param predicate function to test an element for a condition.
     */
    public singleOrDefault(predicate: Func1<TSource, boolean>): Nullable<TSource>;
    public singleOrDefault(predicate?: Func1<TSource, boolean>): Nullable<TSource>
    {
        if (predicate)
        {
            return this.where(predicate).singleOrDefault();
        }

        let current: Nullable<TSource> = null;

        const set = new Set(new Comparer());

        for (const element of this)
        {
            if (!set.add(element))
            {
                return null;
            }

            current = element;
        }

        return current;
    }

    /**
     * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
     * @param count The number of elements to skip before returning the remaining elements.
     */
    public skip(count: number): Enumerable<TSource>
    {
        return new SkipIterator(this, count);
    }

    /**
     * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
     * The element"s index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     */
    public skipWhile(predicate: Func2<TSource, number, boolean>): Enumerable<TSource>
    {
        return new SkipWhileIterator(this, predicate);
    }

    /**
     * The sequence to return elements from.
     * @param count The number of elements to return.
     */
    public take(count: number): Enumerable<TSource>
    {
        return new TakeIterator(this, count);
    }

    /**
     * Returns elements from a sequence as long as a specified condition is true. The element"s index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     */
    public takeWhile(predicate: Func2<TSource, number, boolean>): Enumerable<TSource>
    {
        return new TakeWhileIterator(this, predicate);
    }

    /** Creates an array from a Enumerable<T>. */
    public toArray(): Array<TSource>
    {
        return Array.from(this);
    }

    /**
     * Creates a ILookup<TKey, TElement> from an Enumerable<T> according to a specified key selector function.
     * @param keySelector A function to extract a key from each element.
     */
    public toLookup<TKey, TElement>(keySelector: Func1<TSource, TKey>): ILookup<TKey, TSource>;
    /**
     * Creates a ILookup<TKey, TElement> from an Enumerable<T> according to a specified key selector function and an element selector function.
     * @param keySelector     A function to extract a key from each element.
     * @param elementSelector A transform function to produce a result element value from each element.
     */
    public toLookup<TKey, TElement>(keySelector: Func1<TSource, TKey>, elementSelector: Func1<TSource, TElement>): ILookup<TKey, TElement>;
    /**
     * Creates a ILookup<TKey, TElement> from an Enumerable<T> according to a specified key selector function, a comparer and an element selector function.
     * @param keySelector     A function to extract a key from each element.
     * @param elementSelector A transform function to produce a result element value from each element.
     * @param comparer        An IComparer<T> to compare keys.
     */
    public toLookup<TKey, TElement>(keySelector: Func1<TSource, TKey>, elementSelector: Func1<TSource, TElement>, comparer: IComparer<TKey>): ILookup<TKey, TElement>;
    public toLookup<TKey, TElement>(keySelector: Func1<TSource, TKey>, elementSelector?: Func1<TSource, TElement>, comparer?: IComparer<TKey>): ILookup<TKey, TElement>
    {
        elementSelector = elementSelector || (x => x as Object as TElement);

        return new Lookup(this, keySelector, elementSelector, comparer || new Comparer());
    }

    /**
     * Produces the set union of two sequences.
     * @param second   An Iterable<T> whose distinct elements form the second set for the union.
     */
    public union(second: Iterable<TSource>): Enumerable<TSource>;
    /**
     * Produces the set union of two sequences by using a specified IComparer<T>.
     * @param second   An Iterable<T> whose distinct elements form the second set for the union.
     * @param comparer The IComparer<T> to compare values.
     */
    public union(second: Iterable<TSource>, comparer: IComparer<TSource>): Enumerable<TSource>;
    public union(second: Iterable<TSource>, comparer?: IComparer<TSource>): Enumerable<TSource>
    {
        return new UnionIterator(this, second, comparer || new Comparer());
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
     * @param resultSelector A function that specifies how to merge the elements from the two sequences.
     */
    public zip<TSecond, TResult>(second: Iterable<TSecond>, resultSelector: Func3<TSource, TSecond, number, TResult>): Enumerable<TResult>
    {
        return new ZipIterator(this, second, resultSelector);
    }
}

export default Enumerable;

abstract class OrderedEnumerable<TSource> extends Enumerable<TSource>
{
    private enumerableSorter: EnumerableSorter<Object, TSource>;
    private _parent: Nullable<OrderedEnumerable<TSource>>;
    public get parent(): Nullable<OrderedEnumerable<TSource>>
    {
        return this._parent;
    }

    public set parent(value: Nullable<OrderedEnumerable<TSource>>)
    {
        this._parent = value;
    }

    public constructor(keySelector: Func1<TSource, Object>, descending: boolean, comparer: IComparer<Object>)
    {
        super();
        this.enumerableSorter = new EnumerableSorter(keySelector, descending, comparer);
    }

    public getSorter<TKey>(): EnumerableSorter<TKey, TSource>
    {
        if (this.parent)
        {
            this.enumerableSorter.next = this.parent.getSorter();
        }

        return this.enumerableSorter as EnumerableSorter<TKey, TSource>;
    }

    /**
     * Performs a subsequent ordering of the elements in a sequence in ascending order.
     * @param keySelector A function to extract a key from an element.
     */
    public thenBy<TKey>(keySelector: Func1<TSource, TKey>): OrderedEnumerable<TSource>;
    /**
     * Performs a subsequent ordering of the elements in a sequence in ascending order.
     * @param keySelector A function to extract a key from an element.
     * @param comparer    A function to compare keys.
     */
    public thenBy<TKey>(keySelector: Func1<TSource, TKey>, comparer: IComparer<TKey>): OrderedEnumerable<TSource>;
    public thenBy<TKey>(keySelector: Func1<TSource, TKey>, comparer?: IComparer<TKey>): OrderedEnumerable<TSource>
    {
        return new ThenByIterator(this, keySelector, false, comparer || new Comparer());
    }

    /**
     * Performs a subsequent ordering of the elements in a sequence in descending order.
     * @param keySelector A function to extract a key from an element.
     */
    public thenByDescending<TKey>(keySelector: Func1<TSource, TKey>): OrderedEnumerable<TSource>;
    /**
     * Performs a subsequent ordering of the elements in a sequence in descending order.
     * @param keySelector A function to extract a key from an element.
     * @param comparer    A function to compare keys.
     */
    public thenByDescending<TKey>(keySelector: Func1<TSource, TKey>, comparer: IComparer<TKey>): OrderedEnumerable<TSource>;
    public thenByDescending<TKey>(keySelector: Func1<TSource, TKey>, comparer?: IComparer<TKey>): OrderedEnumerable<TSource>
    {
        return new ThenByIterator(this, keySelector, true, comparer || new Comparer());
    }
}

class ConcatIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private sequence: Iterable<TSource>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        for (const element of this.source)
        {
            yield element;
        }

        for (const element of this.sequence)
        {
            yield element;
        }
    }
}

class DefaultIfEmptyIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private defaultValue: TSource)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        let index = 0;
        for (const element of this.source)
        {
            index++;
            yield element;
        }

        if (index == 0)
        {
            yield this.defaultValue;
        }
    }
}

class DistinctIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private comparer: IComparer<TSource>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        const set = new Set(this.comparer);

        for (const element of this.source)
        {
            if (set.add(element))
            {
                yield element;
            }
        }
    }
}

class EnumerableIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        for (const element of this.source)
        {
            yield element;
        }
    }
}

class ExceptIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private second: Iterable<TSource>, private comparer: IComparer<TSource>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        const set = Set.from(this.second, this.comparer);

        for (const element of this.source)
        {
            if (set.add(element))
            {
                yield element;
            }
        }
    }
}

class JoinIterator<TOutter, TInner, TKey, TResult> extends Enumerable<TResult>
{
    public constructor(private outter: Iterable<TOutter>, private inner: Iterable<TInner>, private outterKeySelector: Func1<TOutter, TKey>, private innerKeySelector: Func1<TInner, TKey>, private resultSelector: Func2<TOutter, TInner, TResult>, private comparer: IComparer<TKey>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        const lookup = new Lookup(this.inner, this.innerKeySelector, x => x, this.comparer);

        for (const element of this.outter)
        {
            const group = lookup.get(this.outterKeySelector(element));

            for (const item of group)
            {
                yield this.resultSelector(element, item);
            }
        }
    }
}

class GroupByIterator<TSource, TKey, TElement, TResult> extends Enumerable<TResult>
{
    public constructor(private source: Iterable<TSource>, private keySelector: Func1<TSource, TKey>, private elementSelector: Func1<TSource, TElement>, private resultSelector: Func2<TKey, Iterable<TElement>, TResult>, private comparer: IComparer<TKey>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        const lookup = new Lookup(this.source, this.keySelector, this.elementSelector, this.comparer);

        for (const group of lookup)
        {
            yield this.resultSelector(group.key, group.elements);
        }
    }
}

class GroupJoinIterator<TOutter, TInner, TKey, TResult> extends Enumerable<TResult>
{
    public constructor(private outter: Iterable<TOutter>, private inner: Iterable<TInner>, private outterKeySelector: Func1<TOutter, TKey>, private innerKeySelector: Func1<TInner, TKey>, private resultSelector: Func2<TOutter, Iterable<TInner>, TResult>, private comparer: IComparer<TKey>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        const lookup = new Lookup(this.inner, this.innerKeySelector, x => x, this.comparer);

        for (const element of this.outter)
        {
            yield this.resultSelector(element, lookup.get(this.outterKeySelector(element)));
        }
    }

}

class LeftJoinIterator<TOutter, TInner, TKey, TResult> extends Enumerable<TResult>
{
    public constructor(private outter: Iterable<TOutter>, private inner: Iterable<TInner>, private outterKeySelector: Func1<TOutter, TKey>, private innerKeySelector: Func1<TInner, TKey>, private resultSelector: Func2<TOutter, Nullable<TInner>, TResult>, private comparer: IComparer<TKey>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        const lookup = new Lookup(this.inner, this.innerKeySelector, x => x, this.comparer);

        for (const element of this.outter)
        {
            const group = lookup.get(this.outterKeySelector(element));

            if (group.length > 0)
            {
                for (const item of group)
                {
                    yield this.resultSelector(element, item);
                }
            }
            else
            {
                yield this.resultSelector(element, null);
            }
        }
    }
}

class OrderByIterator<TKey, TSource> extends OrderedEnumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, keySelector: Func1<TSource, TKey>, descending: boolean, comparer: IComparer<TKey>)
    {
        super(keySelector, descending, comparer);
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        let buffer = Array.from(this.source);

        let indexes = this.getSorter().sort(buffer);

        for (const index of indexes)
        {
            yield buffer[index];
        }
    }
}

class FullJoinIterator<TOutter, TInner, TKey, TResult> extends Enumerable<TResult>
{
    public constructor(private outter: Iterable<TOutter>, private inner: Iterable<TInner>, private outterKeySelector: Func1<TOutter, TKey>, private innerKeySelector: Func1<TInner, TKey>, private resultSelector: Func2<Nullable<TOutter>, Nullable<TInner>, TResult>, private comparer: IComparer<TKey>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        const lookup = new Lookup(this.inner, this.innerKeySelector, x => x, this.comparer);
        const set    = new Set(new Comparer<TInner>());

        for (const element of this.outter)
        {
            const group = lookup.get(this.outterKeySelector(element));

            if (group.length > 0)
            {
                for (const item of group)
                {
                    set.add(item);
                    yield this.resultSelector(element, item);
                }
            }
            else
            {
                yield this.resultSelector(element, null);
            }
        }

        for (const element of this.inner)
        {
            if (set.add(element))
            {
                yield this.resultSelector(null, element);
            }
        }
    }
}

class PrependIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private value: TSource)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        yield this.value;

        for (const element of this.source)
        {
            yield element;
        }
    }
}

class RangeIterator extends Enumerable<number>
{
    public constructor(private start: number, private end: number)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<number>
    {
        for (let i = this.start; i <= this.end; i++)
        {
            yield i;
        }
    }
}

class RepeatIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private element: TSource, private repeatCount: number)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        for (let i = 0; i < this.repeatCount; i++)
        {
            yield this.element;
        }
    }
}

class RightJoinIterator<TOutter, TInner, TKey, TResult> extends Enumerable<TResult>
{
    public constructor(private outter: Iterable<TOutter>, private inner: Iterable<TInner>, private outterKeySelector: Func1<TOutter, TKey>, private innerKeySelector: Func1<TInner, TKey>, private resultSelector: Func2<Nullable<TOutter>, TInner, TResult>, private comparer: IComparer<TKey>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        const lookup = new Lookup(this.outter, this.outterKeySelector, x => x, this.comparer);

        for (const element of this.inner)
        {
            const group = lookup.get(this.innerKeySelector(element));

            if (group.length > 0)
            {
                for (const item of group)
                {
                    yield this.resultSelector(item, element);
                }
            }
            else
            {
                yield this.resultSelector(null, element);
            }
        }
    }
}

class SelectIterator<TSource, TResult> extends Enumerable<TResult>
{
    public constructor(private source: Iterable<TSource>, private selector: Func2<TSource, number, TResult>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        let index = 0;
        for (const element of this.source)
        {
            yield this.selector(element, index++);
        }
    }
}

class SelectManyIterator<TSource, TCollection, TResult> extends Enumerable<TResult>
{
    public constructor(private source: Iterable<TSource>, private collectionSelector: Func1<TSource, Iterable<TCollection>>, private resultSelector: Func3<TSource, TCollection, number, TResult>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        let index = 0;
        for (const element of this.source)
        {
            for (const iteration of this.collectionSelector(element))
            {
                yield this.resultSelector(element, iteration, index);
                index++;
            }
        }
    }
}

class SkipIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private skipCount: number)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        let index = 1;
        for (const element of this.source)
        {
            if (index > this.skipCount)
            {
                yield element;
            }

            index++;
        }
    }
}

class SkipWhileIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private predicate: Func2<TSource, number, boolean>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        let index = 0;
        let skip  = true;

        for (const element of this.source)
        {
            if (skip)
            {
                skip = this.predicate(element, index);
            }

            if (!skip)
            {
                yield element;
            }

            index++;
        }
    }
}

class TakeIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private takeCount: number)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        let index = 0;
        for (const element of this.source)
        {
            if (index < this.takeCount)
            {
                yield element;
            }
            else
            {
                break;
            }

            index++;
        }
    }
}

class TakeWhileIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private predicate: Func2<TSource, number, boolean>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        let index = 0;

        for (const element of this.source)
        {
            if (this.predicate(element, index))
            {
                yield element;
            }
            else
            {
                break;
            }

            index++;
        }
    }
}

class ThenByIterator<TKey, TSource> extends OrderedEnumerable<TSource>
{
    public constructor(private source: OrderedEnumerable<TSource>, keySelector: Func1<TSource, TKey>, descending: boolean, comparer: IComparer<TKey>)
    {
        super(keySelector, descending, comparer);

        source.parent = this;
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        for (const element of this.source)
        {
            yield element;
        }
    }
}

class UnionIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private second: Iterable<TSource>, private comparer: IComparer<TSource>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        const set = new Set(this.comparer);

        for (const element of this.source)
        {
            set.add(element);
            yield element;
        }

        for (const element of this.second)
        {
            if (set.add(element))
            {
                yield element;
            }
        }
    }
}

class WhereIterator<TSource> extends Enumerable<TSource>
{
    public constructor(private source: Iterable<TSource>, private predicate: Func1<TSource, boolean>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TSource>
    {
        for (const element of this.source)
        {
            if (this.predicate(element))
            {
                yield element;
            }
        }
    }
}

class ZipIterator<TSource, TSecond, TResult> extends Enumerable<TResult>
{
    public constructor(private source: Iterable<TSource>, private second: Iterable<TSecond>, private resultSelector: Func3<TSource, TSecond, number, TResult>)
    {
        super();
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        const sourceIterator     = this.source[Symbol.iterator]();
        const collectionIterator = this.second[Symbol.iterator]();

        let nextSource: IteratorResult<TSource>;
        let nextSecond: IteratorResult<TSecond>;

        let index = 0;

        while(!(nextSource = sourceIterator.next()).done && !(nextSecond = collectionIterator.next()).done)
        {
            yield this.resultSelector(nextSource.value, nextSecond.value, index);
            index++;
        }
    }
}