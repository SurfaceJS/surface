export default class Comparer<TKey>
{
    public compare(left: TKey, right: TKey): number
    {
        if (typeof left == "object")
        {
            left = left.constructor.name as Object as TKey;
        }

        if (typeof right == "object")
        {
            right = right.constructor.name as Object as TKey;
        }

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
        if (typeof left == "object" && typeof right == "object")
        {
            return Object.is(left, right);
        }

        return left === right;
    }
}