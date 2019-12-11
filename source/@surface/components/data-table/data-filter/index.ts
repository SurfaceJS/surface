import Component                                from "../..";
import Enumerable                               from "../../../enumerable";
import { attribute, element }                   from "../../decorators";
import List                                     from "../../list";
import { AttributeConverter }                   from "../../types";
import DataFilterItem, { Filter }               from "./data-filter-item";
import template                                 from "./index.html";
import style                                    from "./index.scss";
import { Operator as _Operator, Type as _Type } from "./types";

type Operator = _Operator;
type Type     = _Type;
type KeyValue = { key: string, value: string };

export type Filters = { field: string, type: string, filters: Array<Filter> };

const attributeConverter: AttributeConverter<DataFilter, "type"> =
{
    type: value => (["array", "boolean", "number", "string"].includes(value) ? value : "string") as Type
};

@element("surface-data-filter", template, style)
export default class DataFilter extends Component
{
    private readonly list = super.references.list as List;

    private _fixed: boolean = false;
    private _field: string  = "";
    private _type:  Type    = "string";

    protected get operators(): Array<KeyValue>
    {
        return [{ key: "and", value: "And" }, { key: "or", value: "Or" }];
    }

    public get fixed(): boolean
    {
        return this._fixed;
    }

    public set fixed(value: boolean)
    {
        this._fixed = value;
    }

    public get field(): string
    {
        return this._field;
    }

    public set field(value: string)
    {
        this._field = value;
    }

    @attribute(attributeConverter.type)
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

        const dataFilterItem = super.references.filterItem as DataFilterItem;
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
        const filters = Enumerable.from([super.references.filterItem as DataFilterItem])
            .concat(Array.from(this.list.querySelectorAll("surface-data-filter-item")))
            .select(x => x.getFilter())
            .where(x => x.condition != "none")
            .toArray();

        return { field: this.field, type: this.type, filters };
    }
}