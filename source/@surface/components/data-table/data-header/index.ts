import { Nullable }  from "@surface/core";
import { coalesce }  from "@surface/core/common/generic";
import Component     from "../..";
import { element }   from "../../decorators";
import Modal         from "../../modal";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-header", template, style)
export default class DataHeader extends Component
{
    private _modal: Nullable<Modal>;

    private _field:       string  = "";
    private _fieldType:   string  = "";
    private _filterable:  boolean = true;
    private _index:       number  = 0;
    private _header:      string  = "";
    private _pinned:      boolean = false;
    private _showFilters: boolean = false;
    private _sortable:    boolean = true;

    private get modal(): Nullable<Modal>
    {
        return this._modal || (this._modal = super.shadowQuery<Modal>("surface-modal"));
    }

    protected get showFilters(): boolean
    {
        return this._showFilters;
    }

    public get field(): string
    {
        return this._field;
    }

    public set field(value: string)
    {
        this._field = value;
    }

    public get fieldType(): string
    {
        return this._fieldType;
    }

    public set fieldType(value: string)
    {
        this._fieldType = value;
    }

    public get filterable(): boolean
    {
        return this._filterable;
    }

    public set filterable(value: boolean)
    {
        this._filterable = value;
    }

    public get header(): string
    {
        return this._header;
    }

    public set header(value: string)
    {
        this._header = value;
    }

    public get index(): number
    {
        return this._index;
    }

    public get pinned(): boolean
    {
        return this._pinned;
    }

    public get sortable(): boolean
    {
        return this._sortable;
    }

    public set sortable(value: boolean)
    {
        this._sortable = value;
    }

    public constructor(header?: string, sortable?: boolean, filterable?: boolean, index?: number)
    {
        super();
        this.header     = coalesce(header, "");
        this.sortable   = coalesce(sortable, true);
        this.filterable = coalesce(filterable, true);
        this._index     = coalesce(index, 0);
    }

    protected toogleFilters(): void
    {
        if (!this.modal)
        {
            throw new Error();
        }

        if (!this.showFilters)
        {
            const bounding = this.getBoundingClientRect();

            this.modal.style.position = "absolute";
            this.modal.x = super.offsetLeft + bounding.width;
            this.modal.y = super.offsetTop  + bounding.height;
            this.modal.horizontalAlign = Component.HorizontalAlign.Right;
            this.modal.verticalAlign   = Component.VerticalAlign.Top;

            this.modal.show();
        }
        else
        {
            this.modal.hide();
        }

        this._showFilters = !this.showFilters;
    }

    protected tooglePin(): void
    {
        this._pinned = !this._pinned;
    }
}