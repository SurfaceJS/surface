import { coalesce }  from "@surface/core/common/generic";
import { clone }     from "@surface/core/common/object";
import Type          from "@surface/reflection";
import MethodInfo    from "@surface/reflection/method-info";
import PropertyInfo  from "@surface/reflection/property-info";
import Component     from "../..";
import { element }   from "../../decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-row", template, style)
export default class DataRow<T extends object = object> extends Component
{
    private _data:     T;
    private _editMode: boolean = false;
    private _isNew:    boolean;

    private _reference: T;

    public get data(): T
    {
        return this._data;
    }

    public set data(value: T)
    {
        this._reference = value;

        this.setData(this._data, value);
    }

    public get editMode(): boolean
    {
        return this._editMode;
    }

    public get isNew(): boolean
    {
        return this._isNew;
    }

    public get reference(): T
    {
        return this._reference;
    }

    public constructor(isNew?: boolean, data?: T)
    {
        super();
        this._isNew    = coalesce(isNew, true);
        this._editMode = this._isNew;
        this._data     = clone(data || { }) as T;

        this._reference = data || { } as T;
    }

    private setData(target: object, source: object): void
    {
        type Key   = keyof object;
        type Value = object;

        for (const member of Type.from(target).getMembers())
        {
            if (!(member instanceof MethodInfo) && member.key in source)
            {
                const value = source[member.key as Key] as Value;

                if (value instanceof Object)
                {
                    this.setData(target[member.key as Key], value);
                }
                else if (!(member instanceof PropertyInfo && member.readonly))
                {
                    target[member.key as Key] = source[member.key as Key];
                }
            }
        }
    }

    public enterEdit(): void
    {
        this._editMode = true;
        super.dispatchEvent(new CustomEvent("enter-edit", { detail: this }));
    }

    public leaveEdit(): void
    {
        this._editMode = false;
        super.dispatchEvent(new CustomEvent("leave-edit", { detail: this }));
    }

    public save(): void
    {
        this.setData(this._reference, this._data);
        this._isNew = false;
    }

    public undo(): void
    {
        this.setData(this._data, this._reference);
    }
}