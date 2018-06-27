import { ProxyObject as __ProxyObject__ } from "@surface/core/common/object";
import CustomElement                      from "@surface/custom-element";
import { element }                        from "../../decorators";
import template                           from "./index.html";
import style                              from "./index.scss";

type ProxyObject<T extends object> = __ProxyObject__<T>;

@element("surface-data-row", template, style)
export default class DataRow extends CustomElement
{
    private _data: ProxyObject<object>;
    public get data(): ProxyObject<object>
    {
        return this._data;
    }

    public set data(value: ProxyObject<object>)
    {
        this._data = value;
    }

    private _editMode: boolean = false;
    public get editMode(): boolean
    {
        return this._editMode;
    }

    public set editMode(value: boolean)
    {
        this._editMode = value;
    }

    public constructor(data?: ProxyObject<object>)
    {
        super();
        this._data = data || { save: () => undefined, undo: () => undefined };
    }

    public edit(): void
    {
        this.editMode = true;
    }

    public cancel(): void
    {
        this.data.undo();
        this.editMode = false;
    }

    public save(): void
    {
        this.data.save();
        this.editMode = false;
    }
}