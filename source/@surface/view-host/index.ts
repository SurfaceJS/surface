import template from "./index.html";

import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import View          from "@surface/view";

import { Nullable } from "@surface/types";

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
            this._view = super.get<View>(/^view-/);
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

            this.title = value.name;
        }
        else if (this._view)
        {
            this.removeChild(this._view);
        }

        this._view = value;
    }
}