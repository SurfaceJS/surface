import { Nullable }                             from "@surface/core";
import Component                                from "../..";
import Enumerable                               from "../../../enumerable";
import { attribute, element }                   from "../../decorators";
import List                                     from "../../list";
import DataFilterItem, { Filter }               from "./data-filter-item";
import template                                 from "./index.html";
import style                                    from "./index.scss";
import { Operator as _Operator, Type as _Type } from "./types";

type Operator = _Operator;
type Type     = _Type;
type KeyValue = { key: string, value: string };

export type Filters = { field: string, type: string, filters: Array<Filter> };

@element("surface-data-filter", template, style)
export default class DataFilter extends Component
{
    private readonly list = super.shadowQuery<List>("surface-list")!;

    private _field: string = "";
    private _type:  Type   = "string";

    protected get operators(): Array<KeyValue>
    {
        return [{ key: "and", value: "And" }, { key: "or", value: "Or" }];
    }

    @attribute
    public get field(): string
    {
        return this._field;
    }

    public set field(value: string)
    {
        this._field = value;
    }

    @attribute
    public get type(): Type
    {
        return this._type;
    }

    public set type(value: Type)
    {
        this._type = value;
    }

    public constructor(field?: string, type?: Type)
    {
        super();
        this.field = field || "";
        this.type  = type  || "string";
    }

    protected attributeChangedCallback(name: "field"|"type", _: Nullable<string>, newValue: string)
    {
        const value = name == "field" ?
            newValue
            : name == "type" && ["array", "boolean", "number", "string"].includes(newValue) ?
                newValue :
                "string";

        if (value != this[name])
        {
            this[name] = value;
        }
    }

    protected add(value: Operator): void
    {
        if (this.type != "boolean")
        {
            this.list.add(new DataFilterItem(this.type, value));
        }
    }

    protected clear(): void
    {
        if (this.type != "boolean")
        {
            this.list.clear();
        }

        const dataFilterItem = super.shadowQuery<DataFilterItem>("surface-data-filter-item")!;
        dataFilterItem.clear();
        super.dispatchEvent(new Event("clear"));
    }

    protected apply(): void
    {
        super.dispatchEvent(new Event("apply"));
        console.log(this.getFilters());
    }

    public getFilters(): Filters
    {
        const filters = Enumerable.from([super.shadowQuery<DataFilterItem>("surface-data-filter-item")!])
            .concat(this.list.queryAll<DataFilterItem>("surface-data-filter-item"))
            .select(x => x.getFilter())
            .where(x => x.condition != "none")
            .toArray();

        return { field: this.field, type: this.type, filters };
    }
}