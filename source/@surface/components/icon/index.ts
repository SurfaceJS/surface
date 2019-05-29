import Component              from "..";
import { attribute, element } from "../decorators";
import { setGlobalStyle }     from "../internal/common";
import fontFace               from "./font-face.scss";
import template               from "./index.html";
import style                  from "./index.scss";

setGlobalStyle("material-design", fontFace);

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