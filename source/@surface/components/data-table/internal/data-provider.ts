import { Enumerable } from "@surface/enumerable";
import IDataProvider  from "../interfaces/data-provider";

export default class DataProvider<T> implements IDataProvider<T>
{
    private readonly datasource: Array<T>;

    private _pageCount: number = 0;
    public get pageCount(): number
    {
        return this._pageCount;
    }

    private _page: number = 1;
    public get page(): number
    {
        return this._page;
    }

    public set page(value: number)
    {
        if (value < 1)
        {
            throw new Error("Value cannot be lesser than 1");
        }
        else if (value > this.pageCount)
        {
            throw new Error("Value exceed total of pages");
        }

        this._page = value;
    }

    private _pageSize: number = 0;
    public get pageSize(): number
    {
        return this._pageSize;
    }

    public set pageSize(value: number)
    {
        const total = this.total;

        if (value <= 0)
        {
            throw new Error("Page size cannot be lesser than 1");
        }

        this._pageSize = value;

        const pageCount = total / value;

        this._pageCount = Math.trunc(pageCount) + (pageCount % 1 == 0 ? 0 : 1);
    }

    public get total(): number
    {
        return this.datasource.length;
    }

    public constructor(source: Iterable<T>, pageSize: number)
    {
        this.datasource = Array.from(source);
        this.pageSize   = pageSize;
    }

    public *[Symbol.iterator](): Iterator<T>
    {
        for (const element of Enumerable.from(this.datasource).skip((this.page - 1) * this.pageSize).take(this.pageSize))
        {
            yield element;
        }
    }

    public firstPage(): void
    {
        this._page = 1;
    }

    public nextPage(): void
    {
        if (this._page + 1 < this.pageCount)
        {
            this._page++;
        }
    }

    public lastPage(): void
    {
        this._page = this.pageCount;
    }

    public previousPage(): void
    {
        if (this._page - 1 > 1)
        {
            this._page--;
        }
    }
}