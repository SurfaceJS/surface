import Enumerable from ".";

export interface IComparer<TKey>
{
    compare(left: TKey, right: TKey): number;
    equals(left: TKey, right: TKey):  boolean;
}

export interface IGroup<TKey, TElement>
{
    key:      TKey;
    elements: Enumerable<TElement>;
}

export interface ILookup<TKey, TElement>
{
    count:               number;
    contains(key: TKey): boolean
    get(key: TKey):      Enumerable<TElement>;
}