//import Enumerable from "..";

export default class ConcatIterator<TSource> implements Iterable<TSource>
{
    public [Symbol.iterator]: () => Iterator<TSource>;

    public constructor(source: Iterable<TSource>, sequence: Iterable<TSource>)
    {
        this[Symbol.iterator] = function* ()
        {
            for (const element of source)
            {
                yield element;
            }

            for (const element of sequence)
            {
                yield element;
            }
        };
    }
}