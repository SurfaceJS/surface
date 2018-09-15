import Component              from "..";
import { attribute, element } from "../decorators";
import template               from "./index.html";
import style                  from "./index.scss";

@element("surface-pager", template, style)
export default class Pager extends Component
{
    private _page:       number = 1;
    private _endRange:   number = 0;
    private _startRange: number = 0;

    protected get endRange(): number
    {
        return this._endRange;
    }

    public get page(): number
    {
        return this._page;
    }

    @attribute
    public get pageCount(): number
    {
        return Number.parseInt(super.getAttribute("page-count") || "0") || 0;
    }

    public set pageCount(value: number)
    {
        if (value != this.pageCount)
        {
            if (value < this.page)
            {
                this._page = value;
            }

            super.setAttribute("page-count", value.toString());
            this.pageChanged();
        }
    }

    protected get startRange(): number
    {
        return this._startRange;
    }

    private pageChanged(): void
    {
        const pageCount = this.pageCount;

        this._startRange = this.page > 2 ?
            pageCount - this.page < 2 && pageCount - 4 > 0 ?
                pageCount - 4
                : this.page - 2
            : 1;

        this._endRange = this.startRange + 4 > pageCount ? pageCount : this.startRange + 4;

        super.dispatchEvent(new Event("change"));
    }

    protected attributeChangedCallback(): void
    {
        this.pageChanged();
    }

    public firstPage(): void
    {
        if (this.page != 1)
        {
            this._page = 1;
            this.pageChanged();
        }
    }

    public lastPage(): void
    {
        if (this.page != this.pageCount)
        {
            this._page = this.pageCount;
            this.pageChanged();
        }
    }

    public nextPage(): void
    {
        if (this.page + 1 <= this.pageCount)
        {
            this._page++;
            this.pageChanged();
        }
    }

    public previousPage(): void
    {
        if (this.page - 1 > 0)
        {
            this._page--;
            this.pageChanged();
        }
    }

    public setPage(page: number): void
    {
        if (page != this.page)
        {
            if (page < 1)
            {
                throw new Error("Page cannot be lesser than 1");
            }
            else if (page > this.pageCount)
            {
                throw new Error("Page exceed total of pages");
            }

            this._page = page;

            this.pageChanged();
        }
    }
}