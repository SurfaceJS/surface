import { Func1 }         from "@surface/core";
import ExpressionType    from "../../expression-type";
import IExpression       from "../../interfaces/expression";
import { UnaryOperator } from "../../types";

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
    private readonly operation: Func1<unknown, Object>;

    private readonly _operator: UnaryOperator;
    public get operator(): UnaryOperator
    {
        return this._operator;
    }

    private readonly _expression: IExpression;
    public get expression(): IExpression
    {
        return this._expression;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Unary;
    }

    public constructor(expression: IExpression, operator: UnaryOperator)
    {
        this._operator   = operator;
        this._expression = expression;
        this.operation   = unaryFunctions[this.operator] as Func1<unknown, Object>;
    }

    public evaluate(): Object
    {
        return this.operation(this.expression.evaluate());
    }
}