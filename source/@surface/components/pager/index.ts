import Component              from "..";
import { attribute, element } from "../decorators";
import template               from "./index.html";
import style                  from "./index.scss";

@element("surface-pager", template, style)
export default class Pager extends Component
{
    private _endRange:   number = 0;
    private _page:       number = 0;
    private _pageCount:  number = 0;
    private _startRange: number = 0;

    protected get endRange(): number
    {
        return this._endRange;
    }

    @attribute
    public get page(): number
    {
        return this._page;
    }

    public set page(value: number)
    {
        if (value < 0)
        {
            value = 0;
        }
        else if (value > this.pageCount)
        {
            value = this.pageCount;
        }

        if (value != this.page)
        {
            this._page = value;

            this.changed();
        }
    }

    @attribute
    public get pageCount(): number
    {
        return this._pageCount;
    }

    public set pageCount(value: number)
    {
        if (value != this.pageCount)
        {
            this._pageCount = value;

            if (value < this.page)
            {
                this.page = value;
            }

            if (value > 0 && this.page == 0)
            {
                this.page = 1;
            }

            this.changed();
        }
    }

    protected get startRange(): number
    {
        return this._startRange;
    }

    private changed(): void
    {
        const pageCount = this.pageCount;
        const page      = this.page;

        this._startRange = pageCount - 4 > 0 && page > 2 ?
            pageCount - page < 2 ?
                pageCount - 4
                : page - 2
            : 1;

        const startRange = this.startRange;

        this._endRange = startRange + 4 > pageCount ? pageCount : startRange + 4;

        super.dispatchEvent(new Event("change"));
    }

    protected setPage(page: number): void
    {
        this.page = page;
    }

    public firstPage(): void
    {
        if (this.page != 1)
        {
            this.page = 1;
            this.changed();
        }
    }

    public lastPage(): void
    {
        if (this.page != this.pageCount)
        {
            this.page = this.pageCount;
            this.changed();
        }
    }

    public nextPage(): void
    {
        if (this.page + 1 <= this.pageCount)
        {
            this.page++;
            this.changed();
        }
    }

    public previousPage(): void
    {
        if (this.page - 1 > 0)
        {
            this.page--;
            this.changed();
        }
    }
}