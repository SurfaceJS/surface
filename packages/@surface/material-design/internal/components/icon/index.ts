// eslint-disable-next-line import/no-unassigned-import
import "./font-face.scss?style";

import CustomElement, { attribute, element } from "@surface/custom-element";
import template                              from "./index.htmlx";
import style                                 from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-icon": Icon;
    }
}

@element("smd-icon", { style, template })
export default class Icon extends CustomElement
{
    private _name: string = "";

    @attribute
    public get name(): string
    {
        return this._name;
    }

    public set name(value: string)
    {
        this._name = value;
    }
}