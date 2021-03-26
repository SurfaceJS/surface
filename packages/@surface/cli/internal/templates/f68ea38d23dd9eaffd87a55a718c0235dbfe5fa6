import "./font-face.scss?global";

import CustomElement, { attribute, element } from "@surface/custom-element";
import template                              from "./index.html";
import style                                 from "./index.scss";

@element("app-icon", template, style)
export default class Icon extends CustomElement
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