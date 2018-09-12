import { element }              from "@surface/custom-element/decorators";
import Observer                 from "@surface/observer";
import IDataProvider, { Order } from "../interfaces/data-provider";

@element("surface-data-provider")
export default class DataProvider<T extends object> extends HTMLElement implements IDataProvider<T>
{
    private _order:     Order  = { field: "0", direction: "asc" };
    private _page:      number = 1;
    private _pageCount: number = 0;
    private _total:     number = 0;

    public get createUrl(): string
    {
        return super.getAttribute("create-url") || "" as string;
    }

    public set createUrl(value: string)
    {
        super.setAttribute("create-url", value.toString());
    }

    public get deleteUrl(): string
    {
        return super.getAttribute("delete-url") || "" as string;
    }

    public set deleteUrl(value: string)
    {
        super.setAttribute("delete-url", value.toString());
    }

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
        return Number.parseInt(super.getAttribute("page-size") || "10");
    }

    public set pageSize(value: number)
    {
        super.setAttribute("page-size", value.toString());
        this.assign("pageCount", this.calculatePageCount(this.total));
    }

    public get readUrl(): string
    {
        return super.getAttribute("read-url") || "" as string;
    }

    public set readUrl(value: string)
    {
        super.setAttribute("read-url", value.toString());
    }

    public get updateUrl(): string
    {
        return super.getAttribute("update-url") || "" as string;
    }

    public set updateUrl(value: string)
    {
        super.setAttribute("update-url", value.toString());
    }

    public get total(): number
    {
        return this._total;
    }

    private assign<K extends keyof this>(key: K, value: this[K]): void
    {
        if (this[key] != value)
        {
            this[`_${key}` as K] = value;
            Observer.notify(this, key);
        }
    }

    private calculatePageCount(total: number): number
    {
        const pageCount = total / this.pageSize;

        return Math.trunc(pageCount) + (pageCount % 1 == 0 ? 0 : 1);
    }

    public create(data: T): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public delete(data: T): Promise<void>
    {
        throw new Error("Method not implemented.");
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
        const body =
        {
            page:     this.page,
            pageSize: this.pageSize,
            order:    this.order
        };

        const response = await fetch
        (
            this.readUrl,
            {
                method: "POST",
                body:   JSON.stringify(body),
                headers:
                {
                    "Accept":       "application/json",
                    "Content-Type": "application/json"
                }
            }
        );

        const json = await response.json();

        this.assign("total",     json.total);
        this.assign("pageCount", this.calculatePageCount(this.total));

        return json.data;
    }

    public update(data: T): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
}