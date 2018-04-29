import Enumerable from "..";

export default interface IGroup<TKey, TElement>
{
    key:      TKey;
    elements: Array<TElement>;
}