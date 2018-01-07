import Comparer from "../comparer";

import { Func1, Nullable } from "@surface/types";

export default class EnumerableSorter<TElement, TKey>
{
    private comparer:    Comparer<TKey>;
    private descending:  boolean;
    private keys:        Array<TKey>;
    private keySelector: Func1<TElement, TKey>;
    private next:        Nullable<EnumerableSorter<TElement, TKey>>;

    public constructor(keySelector: Func1<TElement, TKey>, descending: boolean, comparer: Comparer<TKey>, next: Nullable<EnumerableSorter<TElement, TKey>>)
    {
        this.comparer    = comparer;
        this.descending  = descending;
        this.keySelector = keySelector;
        this.next        = next;

        this.keys = [];
    }

    private compareKeys(left: number, right: number): number
    {
        let order = this.comparer.compare(this.keys[left], this.keys[right]);

        if (order == 0)
        {
            if (this.next)
            {
                return this.next.compareKeys(left, right);
            }

            return order;
        }

        if (this.descending)
        {
            return -order;
        }

        return order;
    }

    private computeKeys(elements: Array<TElement>): void
    {
        this.keys = elements.map(x => this.keySelector(x));

        if (this.next)
        {
            this.next.computeKeys(elements);
        }
    }

    private merge(left: Array<number>, right: Array<number>): Array<number>
    {
        let buffer: Array<number> = [];

        let leftIndex  = 0;
        let rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length)
        {
            if (this.compareKeys(left[leftIndex], right[rightIndex]) < 0)
            {
                buffer.push(left[leftIndex]);
                leftIndex++;
            }
            else
            {
                buffer.push(right[rightIndex]);
                rightIndex++;
            }
        }

        while (leftIndex < left.length)
        {
            buffer.push(left[leftIndex]);
            leftIndex++;
        }

        while (rightIndex < right.length)
        {
            buffer.push(right[rightIndex]);
            rightIndex++;
        }

        return buffer;
    }

    private mergeSort(source: Array<number>): Array<number>
    {
        if (source.length > 1)
        {
            const two = 2;
            let middle = Math.floor(source.length / two);

            let left  = source.slice(0, middle);
            let right = source.slice(middle);

            left  = this.mergeSort(left);
            right = this.mergeSort(right);

            return this.merge(left, right);
        }

        return source;
    }

    public sort(elements: Array<TElement>): Array<number>
    {
        this.computeKeys(elements);
        return this.mergeSort(this.keys.map((value, index) => index));
    }
}