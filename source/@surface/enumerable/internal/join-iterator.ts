//import Enumerable from "..";
import Comparer   from "../comparer";
import Lookup     from "./lookup";

import { Func1, Func2 } from "@surface/types";

export default class JoinIterator<TOutter, TInner, TKey, TResult> implements Iterable<TResult>
{
    public [Symbol.iterator]: () => Iterator<TResult>;

    public constructor(outter: Iterable<TOutter>, inner: Iterable<TInner>, outterKeySelector: Func1<TOutter, TKey>, innerKeySelector: Func1<TInner, TKey>, resultSelector: Func2<TOutter, TInner, TResult>, comparer: Comparer<TKey>)
    {
        this[Symbol.iterator] = function* ()
        {
            const lookup = new Lookup(inner, innerKeySelector, x => x, comparer);
            for (const element of outter)
            {
                const group = lookup.get(outterKeySelector(element));

                if (group)
                {
                    for (const iterator of group)
                    {
                        yield resultSelector(element, iterator);
                    }
                }
            }
        };
    }
}