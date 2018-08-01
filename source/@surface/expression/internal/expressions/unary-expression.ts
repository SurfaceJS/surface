import { Func1, Unknown } from "@surface/core";
import ExpressionType     from "../../expression-type";
import IExpression        from "../../interfaces/expression";


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
    private readonly operation: Func1<Unknown, Object>;

    private readonly _operator: string;
    public get operator(): string
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

    public constructor(expression: IExpression, operator: string)
    {
        this._operator   = operator;
        this._expression = expression;
        this.operation   = unaryFunctions[this.operator];
    }

    public evaluate(): Object
    {
        return this.operation(this.expression.evaluate());
    }
}