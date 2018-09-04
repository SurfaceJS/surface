import { element }   from "@surface/custom-element/decorators";
import { notify }    from "@surface/observer/common";
import IDataProvider from "../interfaces/data-provider";

type Order = "asc"|"desc";

@element("surface-data-provider")
export default class DataProvider<T extends object> extends HTMLElement implements IDataProvider<T>
{
    private orderDirection: Order  = "asc";
    private orderField:     string = "";

    private _page:      number = 1;
    private _pageCount: number = 0;
    private _total: number = 0;

    public get page(): number
    {
        return this._page;
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
    }

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

    private calculatePageCount(): void
    {
        const total = this.total;

        const pageCount = total / this.pageSize;

        this._pageCount = Math.trunc(pageCount) + (pageCount % 1 == 0 ? 0 : 1);
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

    public order(field: string, direction: Order): void
    {
        this.orderField     = field;
        this.orderDirection = direction;
    }

    public previousPage(): void
    {
        throw new Error("Method not implemented.");
    }

    public async read(): Promise<Iterable<T>>
    {
        const body =
        {
            page:     this.page,
            pageSize: this.pageSize,
            order:
            {
                direction: this.orderDirection,
                field:     this.orderField
            }
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

        this._total = json.total;

        this.calculatePageCount();

        notify(this, "total");
        notify(this, "pageCount");

        return json.data;
    }

    public update(data: T): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
}