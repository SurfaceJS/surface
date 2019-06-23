import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";
import BaseExpression from "./abstracts/base-expression";

export default class SpreadExpression extends BaseExpression
{
    private readonly _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Spread;
    }

    public constructor(argument: IExpression)
    {
        super();
        this._argument = argument;
    }

    public evaluate(): unknown
    {
        return this.argument.evaluate();
    }

    public toString(): string
    {
        return this.argument.toString();
    }
}