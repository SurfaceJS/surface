import { Indexer }  from "@surface/core";
import { hasValue } from "@surface/core/common/generic";
import IExpression  from "../../interfaces/expression";
import NodeType     from "../../node-type";

export default class ParenthesizedExpression implements IExpression
{
    private cache: unknown;

    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    /* istanbul ignore next */
    public set argument(value: IExpression)
    {
        this._argument = value;
    }

    public get type(): NodeType
    {
        return NodeType.ParenthesizedExpression;
    }

    public constructor(argument: IExpression)
    {
        this._argument = argument;
    }

    public evaluate(scope: Indexer, useCache: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = this.argument.evaluate(scope, useCache);
    }

    public toString(): string
    {
        return `(${this.argument})`;
    }
}