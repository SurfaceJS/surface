import { attribute, element }                   from "@surface/custom-element/decorators";
import Component                                from "../../../";
import { AttributeConverter }                   from "../../../types";
import { Operator as _Operator, Type as _Type } from "../types";
import template                                 from "./index.html";
import style                                    from "./index.scss";

type Condition = "none"|"contains"|"not-in"|"lesser-then"|"greater-than";
type Operator = _Operator;
type Type     = _Type;

type KeyValue = { key: string, value: string };

export type Filter =
{
    condition: string,
    operator:  Operator,
    value:     unknown,
};

const attributeConverter: AttributeConverter<DataFilterItem, "operator"|"type"> =
{
    "operator": (value: string) => ["and", "or"].includes(value) ? value as Operator : null,
    "type":     (value: string) => ["array", "boolean", "number", "string"].includes(value) ? value as Type : "string",
};

@element("surface-data-filter-item", template, style)
export default class DataFilterItem extends Component
{
    private static predicates: Array<KeyValue> =
    [
        { key: "none" ,         value: " - select - " },
        { key: "contains" ,     value: "contains"     },
        { key: "equal" ,        value: "equal"        },
        { key: "not-equal" ,    value: "not equal"    },
        { key: "not-in",        value: "not contains" },
        { key: "lesser-then" ,  value: "lesser than"  },
        { key: "greater-than" , value: "greater than" },
    ];

    private static stringPredicates: Array<KeyValue> = DataFilterItem.predicates.concat
    ([
        { key: "starts-with", value: "starts with" },
        { key: "ends-with",   value: "ends with"   }
    ]);

    private _fixed:     boolean   = false;
    private _condition: Condition = "none";
    private _type:      Type      = "string";
    private _operator:  Operator  = null;
    private _value:     unknown   = null;

    protected operatorMap = { "and": "And", "or": "Or", "bt": "Between" };

    public get condition(): Condition
    {
        return this._condition;
    }

    public set condition(value: Condition)
    {
        this._condition = value;
    }

    @attribute
    public get fixed(): boolean
    {
        return this._fixed;
    }

    public set fixed(value: boolean)
    {
        this._fixed = value;
    }

    @attribute(attributeConverter.operator)
    public get operator(): Operator
    {
        return this._operator;
    }

    public set operator(value: Operator)
    {
        this._operator = value;
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

    public get value(): unknown
    {
        return this._value;
    }

    public set value(value: unknown)
    {
        this._value = value;
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
        this.type     = type     ?? "string";
        this.operator = operator ?? null;
    }

    protected setValue(value: unknown): void
    {
        this.value = value;
    }

    public clear(): void
    {
        this.value     = null;
        this.condition = "none";
    }

    public getFilter(): Filter
    {
      return { condition: this.condition, operator: this.operator, value: this.value };
    }
}