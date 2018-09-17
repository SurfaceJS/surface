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

    public set page(value: number)
    {
        if (value != this.page)
        {
            if (value < 1)
            {
                throw new Error("Page cannot be lesser than 1");
            }
            else if (value > this.pageCount)
            {
                throw new Error("Page exceed total of pages");
            }

            this._page = value;

            this.pageChanged();
        }
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
            super.setAttribute("page-count", value.toString());

            if (value < this.page || this.pageCount > 0 && value > this.pageCount)
            {
                this.page = value;
            }

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
    }

    protected setPage(page: number): void
    {
        this.page = page;
    }

    protected attributeChangedCallback(): void
    {
        this.pageChanged();
    }

    public firstPage(): void
    {
        if (this.page != 1)
        {
            this.page = 1;
            this.pageChanged();
        }
    }

    public lastPage(): void
    {
        if (this.page != this.pageCount)
        {
            this.page = this.pageCount;
            this.pageChanged();
        }
    }

    public nextPage(): void
    {
        if (this.page + 1 <= this.pageCount)
        {
            this.page++;
            this.pageChanged();
        }
    }

    public previousPage(): void
    {
        if (this.page - 1 > 0)
        {
            this.page--;
            this.pageChanged();
        }
    }
}