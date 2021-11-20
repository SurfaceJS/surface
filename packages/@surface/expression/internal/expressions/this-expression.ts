import type { Indexer } from "@surface/core";
import { hasValue }     from "@surface/core";
import type IExpression from "../interfaces/expression";
import NodeType         from "../node-type.js";

export default class ThisExpression implements IExpression
{
    private cache: unknown;

    public get type(): NodeType
    {
        return NodeType.ThisExpression;
    }

    public clone(): ThisExpression
    {
        return new ThisExpression();
    }

    public evaluate(scope: object, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = (scope as Indexer).this;
    }

    public toString(): string
    {
        return "this";
    }
}