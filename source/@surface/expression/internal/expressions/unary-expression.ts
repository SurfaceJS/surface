import { Func1 }         from "@surface/core";
import IExpression       from "../../interfaces/expression";
import NodeType          from "../../node-type";
import { UnaryOperator } from "../../types";
import BaseExpression    from "./abstracts/base-expression";

const unaryFunctions =
{
    "+":      (value: IExpression) => +(value.evaluate() as Object),
    "-":      (value: IExpression) => -(value.evaluate() as Object),
    "~":      (value: IExpression) => ~(value.evaluate() as Object),
    "!":      (value: IExpression) => !value.evaluate(),
    "typeof": (value: IExpression) => typeof value.evaluate(),
};

export default class UnaryExpression extends BaseExpression<Object>
{
    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    public set argument(value: IExpression)
    {
        this._argument = value;
    }

    private readonly operation: Func1<unknown, Object>;

    private _operator: UnaryOperator;
    public get operator(): UnaryOperator
    {
        return this._operator;
    }

    public set operator(value: UnaryOperator)
    {
        this._operator = value;
    }

    public get type(): NodeType
    {
        return NodeType.UnaryExpression;
    }

    public constructor(argument: IExpression, operator: UnaryOperator)
    {
        super();

        this._operator = operator;
        this._argument = argument;
        this.operation = unaryFunctions[this.operator] as Func1<unknown, Object>;
    }

    public evaluate(): Object
    {
        return this._cache = this.operation(this.argument);
    }

    public toString(): string
    {
        return `${this.operator}${this.operator == "typeof" ? " ": ""}${this.argument}`;
    }
}