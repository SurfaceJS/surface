import type IExpression from "../interfaces/expression.js";
import NodeType         from "../node-type.js";

export default class ChainExpression implements IExpression
{
    private readonly _expression: IExpression;

    public get expression(): IExpression
    {
        return this._expression;
    }

    public get type(): NodeType
    {
        return NodeType.ChainExpression;
    }

    public constructor(expression: IExpression)
    {
        this._expression = expression;
    }

    public evaluate(scope: object): unknown
    {
        return this._expression.evaluate(scope);
    }

    public clone(): IExpression
    {
        return new ChainExpression(this._expression.clone());
    }

    public toString(): string
    {
        return this._expression.toString();
    }
}