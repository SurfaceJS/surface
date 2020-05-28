import { clone, Indexer }                 from "@surface/core";
import Type, { MethodInfo, PropertyInfo } from "@surface/reflection";
import Component                          from "../..";
import { element }                        from "../../decorators";
import template                           from "./index.html";
import style                              from "./index.scss";

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
        this._new  = isNew ?? true;
        this._data = clone(data || { }) as T;

        this._reference = data || { } as T;

        if (this.new)
        {
            this.setAttribute("new", "true");
        }
    }

    private copy<TTarget extends object, TSource extends object>(target: TTarget, source: TSource): void;
    private copy(target: Indexer, source: Indexer): void
    {
        for (const member of Type.from(target).getMembers())
        {
            if (!(member instanceof MethodInfo) && member.key in source)
            {
                const key = member.key as string;

                const value = source[key];

                if (value instanceof Object)
                {
                    this.copy(target[key] as Indexer, value as Indexer);
                }
                else if (!(member instanceof PropertyInfo && member.readonly))
                {
                    (target)[key] = source[key];
                }
            }
        }
    }

    public enterEdit(): void
    {
        this._editMode = true;
        this.dispatchEvent(new CustomEvent("enter-edit", { detail: this }));
    }

    public leaveEdit(): void
    {
        this._editMode = false;
        this.dispatchEvent(new CustomEvent("leave-edit", { detail: this }));
    }

    public save(): void
    {
        this.copy(this._reference, this._data);

        if (this.new)
        {
            this.removeAttribute("new");
            this._new = false;
        }
    }

    public undo(): void
    {
        this.copy(this._data, this._reference);
    }
}