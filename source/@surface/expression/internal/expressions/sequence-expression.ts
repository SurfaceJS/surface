import IExpression    from "../../interfaces/expression";
import NodeType       from "../../node-type";
import BaseExpression from "./abstracts/base-expression";

export default class SequenceExpression extends BaseExpression
{
    private _expressions: Array<IExpression>;
    public get expressions(): Array<IExpression>
    {
        return this._expressions;
    }

    public get type(): NodeType
    {
        return NodeType.Sequence;
    }

    public constructor(expressions: Array<IExpression>)
    {
        super();

        this._expressions = expressions;
    }

    public evaluate(): unknown
    {
        let value: unknown;

        for (const expression of this.expressions)
        {
            value = expression.evaluate();
        }

        return this._cache = value;
    }

    public toString(): string
    {
        return `(${this.expressions.map(x => x.toString()).join(", ")})`;
    }
}