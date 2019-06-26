import ExpressionType from "../../expression-type";
import { ParameterElement }  from "../../types";
import BaseExpression from "./abstracts/base-expression";

export default class ParameterExpression extends BaseExpression
{
    private _expression: ParameterElement;
    public get expression(): ParameterElement
    {
        return this._expression;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Parameter;
    }

    public constructor(expression: ParameterElement)
    {
        super();

        this._expression = expression;
    }

    public evaluate(): undefined
    {
        return this._cache = undefined;
    }

    public toString(): string
    {
        return this.expression.toString();
    }
}