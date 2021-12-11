import type { Indexer } from "@surface/core";
import type IExpression from "../interfaces/expression";
import NodeType         from "../node-type.js";

export default class ThisExpression implements IExpression
{
    public get type(): NodeType
    {
        return NodeType.ThisExpression;
    }

    public clone(): ThisExpression
    {
        return new ThisExpression();
    }

    public evaluate(scope: object): unknown
    {
        return (scope as Indexer).this;
    }

    public toString(): string
    {
        return "this";
    }
}