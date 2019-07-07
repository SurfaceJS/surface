import { Indexer }  from "@surface/core";
import { hasValue } from "@surface/core/common/generic";
import IExpression  from "../../interfaces/expression";
import NodeType     from "../../node-type";

export default class ThisExpression implements IExpression
{
    private cache: unknown;

    public get type(): NodeType
    {
        return NodeType.ThisExpression;
    }

    public evaluate(scope: Indexer, useChache: boolean): unknown
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = scope["this"];
    }

    public toString(): string
    {
        return "this";
    }
}