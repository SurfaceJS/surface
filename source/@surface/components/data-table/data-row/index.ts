import { coalesce } from "@surface/core/common/generic";
import { clone }    from "@surface/core/common/object";
import Component    from "../..";
import { element }  from "../../decorators";
import template     from "./index.html";
import style        from "./index.scss";

@element("surface-data-row", template, style)
export default class DataRow<T extends object = object> extends Component
{

    private _data:     T;
    private _editMode: boolean = false;
    private _new:      boolean;

    private _reference: T;

    public get data(): T
    {
        return this._data;
    }

    public set data(value: T)
    {
        this._data = value;
    }

    public get editMode(): boolean
    {
        return this._editMode;
    }

    public get new(): boolean
    {
        return this._new;
    }

    public get reference(): T
    {
        return this._reference;
    }

    public constructor(isNew?: boolean, data?: T)
    {
        super();
        this._new  = coalesce(isNew, true);
        this._data = clone(data || { }) as T;

        this._reference = data || { } as T;

        if (this.new)
        {
            super.setAttribute("new", "true");
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
        this._reference = this._data;

        if (this.new)
        {
            super.removeAttribute("new");
            this._new = false;
        }
    }

    public undo(): void
    {
        this._data = this._reference;
    }
}