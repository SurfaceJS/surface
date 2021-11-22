import "./font-face.scss?style";

import HTMLXElement, { attribute, element } from "@surface/htmlx-element";
import template                             from "./index.htmlx";
import style                                from "./index.scss";

@element("app-icon", { template, style })
export default class Icon extends HTMLXElement
{
    private _name = "";

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