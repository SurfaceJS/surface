import { Nullable }                             from "@surface/core";
import Component                                from "../../../";
import { attribute, element }                   from "../../../decorators";
import { Operator as _Operator, Type as _Type } from "../types";
import template                                 from "./index.html";
import style                                    from "./index.scss";

type Operator = _Operator;
type Type     = _Type;

type KeyValue = { key: string, value: string };

@element("surface-data-filter-item", template, style)
export default class DataFilterItem extends Component
{
    private static attributeParse =
    {
        "fixed":    (value: string) => value == "true",
        "operator": (value: string) => ["and", "or"].includes(value) ? value as Operator : "and",
        "type":     (value: string) => ["array", "boolean", "number", "string"].includes(value) ? value as Type : "string",
    };

    private static predicates: Array<KeyValue> =
    [
        { key: "no" , value: " - select - " },
        { key: "in" , value: "contains"     },
        { key: "nin", value: "not contains" },
        { key: "lt" , value: "lesser than"  },
        { key: "gt" , value: "greater than" },
    ];

    private static stringPredicates: Array<KeyValue> = DataFilterItem.predicates.concat
    ([
        { key: "sw" , value: "starts with"  },
        { key: "en" , value: "ends with"    }
    ]);

    private _fixed:    boolean  = false;
    private _type:     Type     = "string";
    private _operator: Operator = "and";

    protected operatorMap = { "and": "And", "or": "Or", "bt": "Between" };

    @attribute
    public get fixed(): boolean
    {
        return this._fixed;
    }

    public set fixed(value: boolean)
    {
        this._fixed = value;
    }

    @attribute
    public get operator(): Operator
    {
        return this._operator;
    }

    public set operator(value: Operator)
    {
        this._operator = value;
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

    public get predicates(): Array<KeyValue>
    {
        return DataFilterItem.predicates;
    }

    public get stringPredicates(): Array<KeyValue>
    {
        return DataFilterItem.stringPredicates;
    }

    public constructor();
    public constructor(type: Type, operator: Operator)
    public constructor(type?: Type, operator?: Operator)
    {
        super();
        this.type     = type     || "string";
        this.operator = operator || this.operator;
    }

    protected attributeChangedCallback(name: "operator"|"type", _: Nullable<string>, newValue: string)
    {
        const value = DataFilterItem.attributeParse[name](newValue);

        if (value != this[name])
        {
            this[name] = value;
        }
    }
}