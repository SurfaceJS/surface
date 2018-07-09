import { }           from "@surface/core";
import { element }   from "@surface/custom-element/decorators";
import IDataProvider from "../interfaces/data-provider";

@element("surface-data-provider")
export default class DataProvider<T extends object> extends HTMLElement implements IDataProvider<T>
{
    private _page: number = 0;
    public get page(): number
    {
        return this._page;
    }

    public set page(value: number)
    {
        this._page = value;
    }

    private _pageCount: number = 0;
    public get pageCount(): number
    {
        return this._pageCount;
    }

    public set pageCount(value: number)
    {
        this._pageCount = value;
    }

    public get pageSize(): number
    {
        return Number.parseInt(super.getAttribute("page-size") || "10");
    }

    public set pageSize(value: number)
    {
        super.setAttribute("page-size", value.toString());
    }

    private _total: number = 0;
    public get total(): number
    {
        return this._total;
    }

    public set total(value: number)
    {
        this._total = value;
    }

    public *[Symbol.iterator](): Iterator<T>
    {
        throw new Error("Method not implemented.");
    }

    public add(data: T): void
    {
        throw new Error("Method not implemented.");
    }

    public delete(data: T): void
    {
        throw new Error("Method not implemented.");
    }

    public firstPage(): void
    {
        throw new Error("Method not implemented.");
    }

    public nextPage(): void
    {
        throw new Error("Method not implemented.");
    }

    public lastPage(): void
    {
        throw new Error("Method not implemented.");
    }

    public previousPage(): void
    {
        throw new Error("Method not implemented.");
    }
}