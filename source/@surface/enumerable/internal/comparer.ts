import IComparer from "./interfaces/comparer";

export default class Comparer<TKey> implements IComparer<TKey>
{
    public compare(left: TKey, right: TKey): number
    {
        if (left > right)
        {
            return 1;
        }
        else if (left < right)
        {
            return -1;
        }

        return 0;
    }

    public equals(left: TKey, right: TKey): boolean
    {
        return Object.is(left, right);
    }
}