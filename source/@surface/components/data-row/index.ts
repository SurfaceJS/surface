import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-row", template, style)
export default class DataRow extends CustomElement
{
    private _data: Object = { };
    public get data(): Object
    {
        return this._data;
    }

    public set data(value: Object)
    {
        this._data = value;
    }
}