import type { Delegate } from "@surface/core";
import type IComparer    from "./interfaces/comparer";

export default class EnumerableSorter<TKey, TElement>
{
    private readonly comparer:    IComparer<TKey>;
    private readonly descending:  boolean;
    private readonly keySelector: Delegate<[TElement], TKey>;

    private keys: TKey[];
    private _next: EnumerableSorter<TKey, TElement> | null;

    public get next(): EnumerableSorter<TKey, TElement> | null
    {
        return this._next;
    }

    public set next(value: EnumerableSorter<TKey, TElement> | null)
    {
        this._next = value;
    }

    public constructor(keySelector: Delegate<[TElement], TKey>, descending: boolean, comparer: IComparer<TKey>, next?: EnumerableSorter<TKey, TElement> | null)
    {
        this.comparer    = comparer;
        this.descending  = descending;
        this.keySelector = keySelector;
        this._next       = next ?? null;

        this.keys = [];
    }

    private compareKeys(left: number, right: number): number
    {
        const order = this.comparer.compare(this.keys[left]!, this.keys[right]!);

        if (order == 0)
        {
            if (this.next)
            {
                return this.next.compareKeys(left, right);
            }
        }

        if (this.descending)
        {
            return -order;
        }

        return order;
    }

    private computeKeys(elements: TElement[]): void
    {
        this.keys = elements.map(x => this.keySelector(x));

        if (this.next)
        {
            this.next.computeKeys(elements);
        }
    }

    private merge(left: number[], right: number[]): number[]
    {
        const buffer: number[] = [];

        let leftIndex  = 0;
        let rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length)
        {
            if (this.compareKeys(left[leftIndex]!, right[rightIndex]!) < 0)
            {
                buffer.push(left[leftIndex]!);
                leftIndex++;
            }
            else
            {
                buffer.push(right[rightIndex]!);
                rightIndex++;
            }
        }

        while (leftIndex < left.length)
        {
            buffer.push(left[leftIndex]!);
            leftIndex++;
        }

        while (rightIndex < right.length)
        {
            buffer.push(right[rightIndex]!);
            rightIndex++;
        }

        return buffer;
    }

    private mergeSort(source: number[]): number[]
    {
        if (source.length > 1)
        {
            const middle = Math.floor(source.length / 2);

            let left  = source.slice(0, middle);
            let right = source.slice(middle);

            left  = this.mergeSort(left);
            right = this.mergeSort(right);

            return this.merge(left, right);
        }

        return source;
    }

    public sort(elements: TElement[]): number[]
    {
        this.computeKeys(elements);

        return this.mergeSort(this.keys.map((_, index) => index));
    }
}
