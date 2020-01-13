import "./font-face.scss?global";

import { attribute, element } from "@surface/custom-element/decorators";
import Component              from "..";
import template               from "./index.html";
import style                  from "./index.scss";

@element("surface-icon", template, style)
export default class Icon extends Component
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