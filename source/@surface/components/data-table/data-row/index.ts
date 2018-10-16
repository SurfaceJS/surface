import { ObjectLiteral } from "@surface/core";
import ActionQueue       from "@surface/core/action-queue";
import { coalesce }      from "@surface/core/common/generic";
import { clone }         from "@surface/core/common/object";
import Type              from "@surface/reflection";
import MethodInfo        from "@surface/reflection/method-info";
import PropertyInfo      from "@surface/reflection/property-info";
import Component         from "../..";
import Observer          from "../../../observer";
import { element }       from "../../decorators";
import template          from "./index.html";
import style             from "./index.scss";

@element("surface-data-row", template, style)
export default class DataRow<T extends object = object> extends Component
{
    private readonly unsubscribers: ActionQueue = new ActionQueue();

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
        this._reference = value;

        this.unsubscribers.executeAsync();

        this.setData(this._data, value);
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

    private setData(target: ObjectLiteral, source: ObjectLiteral): void
    {
        for (const member of Type.from(target).getMembers())
        {
            if (!(member instanceof MethodInfo) && member.key in source)
            {
                const key = member.key as string;

                const value = source[key];

                if (value instanceof Object)
                {
                    this.setData(target[key] as object, value);
                }
                else if (!(member instanceof PropertyInfo && member.readonly))
                {
                    const listener = (x: unknown) => target[key] = x;

                    const observer = Observer.observe(source, key)
                        .subscribe(listener)
                        .notify(value);

                    this.unsubscribers.add(() => observer.unsubscribe(listener));
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

        if (this.new)
        {
            super.removeAttribute("new");
            this._new = false;
        }
    }

    public undo(): void
    {
        this.setData(this._data, this._reference);
    }
}