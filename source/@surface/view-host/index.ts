import template from './index.html';

import { CustomElement } from '@surface/custom-element';
import { element }       from '@surface/custom-element/decorators';
import { Nullable }      from '@surface/types';
import { View }          from '@surface/view';

@element('surface-view-host', template)
export class ViewHost extends CustomElement
{
    private _title: string;

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
        if (this.shadowRoot && !this._view)
        {
            this._view = super.attach<View>(/^view-/);
        }

        return this._view;
    }

    public set view(value: Nullable<View>)
    {
        if (this.shadowRoot && value)
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
        this._view = value;
    }
}