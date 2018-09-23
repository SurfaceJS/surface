import { Nullable }           from "@surface/core";
import { dashedToCamel }      from "@surface/core/common/string";
import Component              from "..";
import { attribute, element } from "../decorators";
import template               from "./index.html";
import style                  from "./index.scss";

@element("surface-pager", template, style)
export default class Pager extends Component
{
    private _page:       number = 1;
    private _endRange:   number = 0;
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
            if (value > 0 && value < this.page)
            {
                this.page = value;
            }

            this._pageCount = value;

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

    protected attributeChangedCallback(name: "page"|"page-count", _: Nullable<string>, newValue: string)
    {
        const key   = dashedToCamel(name) as "page"|"pageCount";
        const value = Number.parseInt(`${newValue}`) || (name == "page" ? 1 : 0);

        if (value != this[key])
        {
            this[key] = value;
        }
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