import { Indexer }  from "@surface/core";
import { hasValue } from "@surface/core/common/generic";
import IExpression  from "../../interfaces/expression";
import NodeType     from "../../node-type";

export default class SequenceExpression implements IExpression
{
    private cache: unknown;

    private _expressions: Array<IExpression>;
    public get expressions(): Array<IExpression>
    {
        return this._expressions;
    }

    /* istanbul ignore next */
    public set expressions(value: Array<IExpression>)
    {
        this._expressions = value;
    }

    public get type(): NodeType
    {
        return NodeType.SequenceExpression;
    }

    public constructor(expressions: Array<IExpression>)
    {
        this._expressions = expressions;
    }

    public evaluate(scope: Indexer, useChache: boolean): unknown
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        let value: unknown;

        for (const expression of this.expressions)
        {
            value = expression.evaluate(scope, useChache);
        }

        return this.cache = value;
    }

    public toString(): string
    {
        return `(${this.expressions.map(x => x.toString()).join(", ")})`;
    }
}