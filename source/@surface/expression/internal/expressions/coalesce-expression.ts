import { Indexer, hasValue } from "@surface/core";
import ICoalesceExpression   from "../interfaces/coalesce-expression";
import IExpression           from "../interfaces/expression";
import NodeType              from "../node-type";

export default class CoalesceExpression implements IExpression
{
    private cache: unknown;

    private _left: IExpression;
    public get left(): IExpression
    {
        return this._left;
    }

    /* istanbul ignore next */
    public set left(value: IExpression)
    {
        this._left = value;
    }

    private _right: IExpression;
    public get right(): IExpression
    {
        return this._right;
    }

    /* istanbul ignore next */
    public set right(value: IExpression)
    {
        this._right = value;
    }

    public get type(): NodeType
    {
        return NodeType.CoalesceExpression;
    }

    public constructor(left: IExpression, right: IExpression)
    {
        this._left  = left;
        this._right = right;
    }

    public clone(): ICoalesceExpression
    {
        return new CoalesceExpression(this.left.clone(), this.right.clone());
    }

    public evaluate(scope: Indexer<unknown>, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = this.left.evaluate(scope, useCache) ?? this.right.evaluate(scope, useCache);
    }

    public toString(): string
    {
        return `${this.left} ?? ${this.right}`;
    }
}