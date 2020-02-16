import "./font-face.scss?global";

import CustomElement          from "@surface/custom-element";
import { attribute, element } from "@surface/custom-element/decorators";
import template               from "./index.html";
import style                  from "./index.scss";

@element("smd-icon", template, style)
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