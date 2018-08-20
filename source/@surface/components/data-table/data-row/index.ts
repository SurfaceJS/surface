import { coalesce }                       from "@surface/core/common/generic";
import { ProxyObject as __ProxyObject__ } from "@surface/core/common/object";
import CustomElement                      from "@surface/custom-element";
import Type                               from "@surface/reflection";
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
        this.setData(this._data, value);
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
        this._data     = data || { getSource: () => ({ }), save: () => undefined, undo: () => undefined };
    }

    private setData(target: object, source: object): void
    {
        for (const property of Type.from(target).getProperties())
        {
            const value = source[property.key as keyof Object];
            if (value instanceof Object)
            {
                this.setData(target[property.key as keyof Object], value);
            }
            else
            {
                if (!property.readonly)
                {
                    target[property.key as keyof Object] = source[property.key as keyof Object];
                }
            }
        }
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