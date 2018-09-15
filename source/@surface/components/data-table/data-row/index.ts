import { coalesce }  from "@surface/core/common/generic";
import { clone }     from "@surface/core/common/object";
import CustomElement from "@surface/custom-element";
import Type          from "@surface/reflection";
import MethodInfo    from "@surface/reflection/method-info";
import PropertyInfo  from "@surface/reflection/property-info";
import { element }   from "../../decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-row", template, style)
export default class DataRow extends CustomElement
{
    private backup: object;

    private _data:     object;
    private _editMode: boolean = false;
    private _isNew:    boolean;

    public get data(): object
    {
        return this._data;
    }

    public set data(value: object)
    {
        this.setData(this._data, value);
    }

    public get editMode(): boolean
    {
        return this._editMode;
    }

    public set editMode(value: boolean)
    {
        this._editMode = value;
    }

    public get isNew(): boolean
    {
        return this._isNew;
    }

    public set isNew(value: boolean)
    {
        this._isNew = value;
    }

    public constructor(isNew?: boolean, data?: object)
    {
        super();
        this._isNew    = coalesce(isNew, true);
        this._editMode = this._isNew;
        this._data     = data || { };
        this.backup    = clone(this._data);
    }

    private setData(target: object, source: object): void
    {
        type Key   = keyof Object;
        type Value = Object[Key];

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
        this.editMode = true;
    }

    public leaveEdit(): void
    {
        this.editMode = false;
    }

    public save(): void
    {
        this.backup = this._data;
    }

    public undo(): void
    {
        this.setData(this._data, this.backup);
    }
}