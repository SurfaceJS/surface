import { Nullable }  from "@surface/core";
import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import View          from "@surface/view";
import template      from "./index.html";

@element("surface-view-host", template)
export default class ViewHost extends CustomElement
{
    private _title: string = "";
    public get title(): string
    {
        return this._title;
    }

    public set title(value: string)
    {
        this._title = value;
    }

    private _view:  Nullable<View>;
    public get view(): Nullable<View>
    {
        if (!this._view)
        {
            this._view = super.queryAll<View>("*").firstOrDefault(x => /^view-/.test(x.tagName));
        }

        return this._view;
    }

    public set view(value: Nullable<View>)
    {
        if (value)
        {
            if (this._view)
            {
                this.replaceChild(value, this._view);
            }
            else
            {
                this.appendChild(value);
            }

            this.title = value.viewName;
        }
        else if (this._view)
        {
            this.removeChild(this._view);
        }

        this._view = value;
    }
}