export default interface IComparer<TKey>
{
    compare(left: TKey, right: TKey): number;
    equals(left: TKey, right: TKey):  boolean;
}