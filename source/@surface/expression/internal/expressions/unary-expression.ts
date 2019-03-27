import { Func1, Nullable } from "@surface/core";
import { coalesce }        from "@surface/core/common/generic";
import ExpressionType      from "../../expression-type";
import IExpression         from "../../interfaces/expression";
import { UnaryOperator }   from "../../types";

const unaryFunctions =
{
    "+":      (value: IExpression) => +(value.evaluate() as Object),
    "-":      (value: IExpression) => -(value.evaluate() as Object),
    "~":      (value: IExpression) => ~(value.evaluate() as Object),
    "!":      (value: IExpression) => !value.evaluate(),
    "typeof": (value: IExpression) => typeof value.evaluate(),
};

export default class UnaryExpression implements IExpression
{
    private _cache: Nullable<Object>;
    public get cache(): Object
    {
        return coalesce(this._cache, () => this.evaluate());
    }

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
        return this._cache = this.operation(this.expression);
    }
}