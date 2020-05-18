import { Indexer, hasValue } from "@surface/core";
import IExpression           from "../interfaces/expression";
import IThisExpression       from "../interfaces/this-expression";
import NodeType              from "../node-type";

export default class ThisExpression implements IExpression
{
    private cache: unknown;

    public get type(): NodeType
    {
        return NodeType.ThisExpression;
    }

    public clone(): IThisExpression
    {
        return new ThisExpression();
    }

    public evaluate(scope: Indexer, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
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