export default interface ILookup<TKey, TElement>
{
    count:               number;
    contains(key: TKey): boolean
    get(key: TKey):      Array<TElement>;
}