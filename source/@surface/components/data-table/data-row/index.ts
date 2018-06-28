import { coalesce }                       from "@surface/core/common/generic";
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

    private _isNew: boolean;
    public get isNew(): boolean
    {
        return this._isNew;
    }

    public set isNew(value: boolean)
    {
        this._isNew = value;
    }

    public constructor(isNew?: boolean, data?: ProxyObject<object>)
    {
        super();
        this._isNew    = coalesce(isNew, true);
        this._editMode = this._isNew;
        this._data     = data || { source: { }, save: () => undefined, undo: () => undefined };
    }

    public enterEdit(): void
    {
        this.editMode = true;
    }

    public leaveEdit(): void
    {
        this.editMode = false;
    }
}