import List                     from "@surface/collection/list";
import { Func1 }                from "@surface/core";
import { Enumerable }           from "@surface/enumerable";
import Observer                 from "@surface/observer";
import IDataProvider, { Order } from "../interfaces/data-provider";

export default class DataProvider<T extends Object> implements IDataProvider<T>
{
    private readonly datasource: List<T>;

    private _order:     Order;
    private _lastOrder: Order;
    private _page:      number = 1;
    private _pageCount: number = 0;
    private _pageSize:  number = 0;

    public get order(): Order
    {
        return this._order;
    }

    public set order(value: Order)
    {
        this._order = value;
    }

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

    public get pageCount(): number
    {
        return this._pageCount;
    }

    public get pageSize(): number
    {
        return this._pageSize;
    }

    public set pageSize(value: number)
    {
        if (value <= 0)
        {
            throw new Error("Page size cannot be lesser than 1");
        }

        this._pageSize = value;

        this.assign("pageCount", this.calculatePageCount(this.total));
    }

    public get total(): number
    {
        return this.datasource.count();
    }

    public constructor(source: Iterable<T>, pageSize: number)
    {
        this.datasource = new List(source);
        this._order     = { field: "", direction: "asc" };
        this._lastOrder = { field: "", direction: "asc" };
        this._pageSize  = pageSize;
        this._pageCount = this.calculatePageCount(this.total);
    }

    private assign<K extends keyof this>(key: K, value: this[K]): void
    {
        if (this[key] != value)
        {
            this["_" + key as K] = value;
            Observer.notify(this, key);
        }
    }

    private calculatePageCount(total: number): number
    {
        const pageCount = total / this.pageSize;

        return Math.trunc(pageCount) + (pageCount % 1 == 0 ? 0 : 1);
    }

    public async create(data: T): Promise<void>
    {
        this.datasource.add(data);

        Observer.notify(this, "total");
        this.assign("pageCount", this.calculatePageCount(this.total));
    }

    public async delete(data: T): Promise<void>
    {
        this.datasource.remove(data);

        Observer.notify(this, "total");
        this.assign("pageCount", this.calculatePageCount(this.total));
    }

    public firstPage(): void
    {
        this._page = 1;
    }

    public lastPage(): void
    {
        this._page = this.pageCount;
    }

    public nextPage(): void
    {
        if (this._page + 1 <= this.pageCount)
        {
            this._page++;
        }
    }

    public previousPage(): void
    {
        if (this._page - 1 > 0)
        {
            this._page--;
        }
    }

    public async read(): Promise<Iterable<T>>
    {
        Observer.notify(this, "total");
        Observer.notify(this, "pageCount");

        let datasource = this.datasource as Enumerable<T>;

        if (this.order.field != this._lastOrder.field || this.order.direction != this._lastOrder.direction)
        {
            const predicate = this.order.field.includes(".") ?
                Function("x", "return x." + this.order.field) as Func1<T, T[keyof T]> :
                (element: T) => element[this.order.field as keyof T];

            datasource = this._order.direction == "asc" ?
                datasource.orderBy(predicate)
                : datasource.orderByDescending(predicate);

            this._lastOrder.field     = this.order.field;
            this._lastOrder.direction = this.order.direction;
        }

        return await Promise.resolve(datasource.skip((this.page - 1) * this.pageSize).take(this.pageSize));
    }

    public async update(data: T): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
}