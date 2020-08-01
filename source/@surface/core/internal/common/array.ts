export function contains<T>(source: Array<T>, elements: Array<T>): boolean
{
    for (const element of elements)
    {
        if (source.includes(element))
        {
            return true;
        }
    }

    return false;
}

export function *enumerate<T>(source: Array<T>): IterableIterator<T>
{
    for (const element of source)
    {
        yield element;
    }
}

export function *iterate<TElement, TReturn>(elements: Iterable<TElement>, action: (element: TElement, index: number) => TReturn): IterableIterator<TReturn>
{
    let index = 0;

    for (const element of elements)
    {
        yield action(element, index);

        index++;
    }
}