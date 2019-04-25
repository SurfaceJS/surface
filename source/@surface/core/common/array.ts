export function contains<T>(source: Array<T>, ...elements: Array<T>): boolean
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