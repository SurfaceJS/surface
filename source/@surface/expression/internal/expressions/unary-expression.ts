import IExpression from "../../interfaces/expression";

import { Func1, Nullable } from "@surface/types";

const unaryFunctions =
{
    "+":      (value: Object) => +value,
    "-":      (value: Object) => -value,
    "~":      (value: Object) => ~value,
    "!":      (value: Object) => !value,
    "typeof": (value: Object) => typeof value,
};

export default class UnaryExpression implements IExpression
{
    private readonly operation: Func1<Nullable<Object>, Object>;

    private readonly _operator: string;
    public get operator(): string
    {
        return this._operator;
    }

    private readonly _value: IExpression;
    public get value(): IExpression
    {
        return this._value;
    }

    public constructor(value: IExpression, operator: string)
    {
        this._operator = operator;
        this._value    = value;
        this.operation = unaryFunctions[this.operator];
    }

    public evaluate(): Object
    {
        return this.operation(this.value.evaluate());
    }
}