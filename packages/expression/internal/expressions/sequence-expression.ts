import type IExpression from "../interfaces/expression";
import NodeType         from "../node-type.js";

export default class SequenceExpression implements IExpression
{
    private _expressions: IExpression[];
    public get expressions(): IExpression[]
    {
        return this._expressions;
    }

    /* c8 ignore next 4 */
    public set expressions(value: IExpression[])
    {
        this._expressions = value;
    }

    public get type(): NodeType
    {
        return NodeType.SequenceExpression;
    }

    public constructor(expressions: IExpression[])
    {
        this._expressions = expressions;
    }

    public clone(): SequenceExpression
    {
        return new SequenceExpression(this.expressions.map(x => x.clone()));
    }

    public evaluate(scope: object): unknown
    {
        let value: unknown;

        for (const expression of this.expressions)
        {
            value = expression.evaluate(scope);
        }

        return value;
    }

    public toString(): string
    {
        return `(${this.expressions.map(x => x.toString()).join(", ")})`;
    }
}