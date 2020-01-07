import "./font-face.scss?global";

import Component              from "..";
import { attribute, element } from "../decorators";
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