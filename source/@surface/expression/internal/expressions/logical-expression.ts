import { Indexer, hasValue } from "@surface/core";
import IExpression           from "../interfaces/expression";
import ILogicalExpression    from "../interfaces/logical-expression";
import NodeType              from "../node-type";
import { LogicalOperator }   from "../types";

type Operation = (left: IExpression, right: IExpression, scope: Indexer, useCache: boolean) => unknown;

const binaryFunctions: Record<LogicalOperator, Operation> =
{
    "&&": (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) && (right.evaluate(scope, useCache) as Object),
    "||": (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) || (right.evaluate(scope, useCache) as Object),
};

export default class LogicalExpression implements IExpression
{
    private readonly operation: Operation;

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

    private _operator: LogicalOperator;
    public get operator(): LogicalOperator
    {
        return this._operator;
    }

    /* istanbul ignore next */
    public set operator(value: LogicalOperator)
    {
        this._operator = value;
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
        return NodeType.LogicalExpression;
    }

    public constructor(left: IExpression, right: IExpression, operator: LogicalOperator)
    {
        this._left     = left;
        this._operator = operator;
        this._right    = right;
        this.operation = binaryFunctions[this.operator];
    }

    public clone(): ILogicalExpression
    {
        return new LogicalExpression(this.left.clone(), this.right.clone(), this.operator);
    }

    public evaluate(scope: Indexer, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = this.operation(this.left, this.right, scope, !!useCache);
    }

    public toString(): string
    {
        return `${this.left} ${this.operator} ${this.right}`;
    }
}