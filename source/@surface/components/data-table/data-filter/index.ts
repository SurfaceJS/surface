import { Nullable }                             from "@surface/core";
import Component                                from "../..";
import { attribute, element }                   from "../../decorators";
import DataFilterItem                           from "./data-filter-item";
import template                                 from "./index.html";
import style                                    from "./index.scss";
import { Operator as _Operator, Type as _Type } from "./types";

type Operator = _Operator;
type Type     = _Type;
type KeyValue = { key: string, value: string };

@element("surface-data-filter", template, style)
export default class DataFilter extends Component
{
    private _type: Type = "string";
    private get container(): Nullable<HTMLDivElement>
    {
        return super.shadowQuery("#container");
    }

    protected get operators(): Array<KeyValue>
    {
        return [{ key: "and", value: "And" }, { key: "or", value: "Or" }];
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

    protected attributeChangedCallback(__: "type", _: Nullable<string>, newValue: string)
    {
        const value = (["array", "boolean", "number", "string"].includes(newValue) ? newValue : "string") as Type;

        if (value != this.type)
        {
            this.type = value;
        }
    }

    protected add(value: Operator): void
    {
        if (this.type != "boolean" && this.container)
        {
            this.container.appendChild(new DataFilterItem(this.type, value));
        }
    }
}