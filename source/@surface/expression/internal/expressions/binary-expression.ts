import type { Indexer }        from "@surface/core";
import { hasValue }            from "@surface/core";
import type IBinaryExpression  from "../interfaces/binary-expression";
import type IExpression        from "../interfaces/expression";
import NodeType                from "../node-type.js";
import type { BinaryOperator } from "../types/operators";

type Operation = (left: IExpression, right: IExpression, scope: Indexer, useCache: boolean) => unknown;

const binaryFunctions: Record<BinaryOperator, Operation> =
{
    "!=":         (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) !=         (right.evaluate(scope, useCache) as Object),
    "!==":        (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) !==        (right.evaluate(scope, useCache) as Object),
    "%":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) %          (right.evaluate(scope, useCache) as number),
    "&":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) &          (right.evaluate(scope, useCache) as number),
    "*":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) *          (right.evaluate(scope, useCache) as number),
    "**":         (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) **         (right.evaluate(scope, useCache) as number),
    "+":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) +          (right.evaluate(scope, useCache) as number),
    "-":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) -          (right.evaluate(scope, useCache) as number),
    "/":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) /          (right.evaluate(scope, useCache) as number),
    "<":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) <          (right.evaluate(scope, useCache) as Object),
    "<<":         (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) <<         (right.evaluate(scope, useCache) as number),
    "<=":         (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) <=         (right.evaluate(scope, useCache) as Object),
    "==":         (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) ==         (right.evaluate(scope, useCache) as Object),
    "===":        (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) ===        (right.evaluate(scope, useCache) as Object),
    ">":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) >          (right.evaluate(scope, useCache) as Object),
    ">=":         (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) >=         (right.evaluate(scope, useCache) as Object),
    ">>":         (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) >>         (right.evaluate(scope, useCache) as number),
    ">>>":        (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) >>>        (right.evaluate(scope, useCache) as number),
    "^":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) ^          (right.evaluate(scope, useCache) as number),
    "in":         (left, right, scope, useCache) => (left.evaluate(scope, useCache) as string) in         (right.evaluate(scope, useCache) as Function),
    "instanceof": (left, right, scope, useCache) => (left.evaluate(scope, useCache) as Object) instanceof (right.evaluate(scope, useCache) as Function),
    "|":          (left, right, scope, useCache) => (left.evaluate(scope, useCache) as number) |          (right.evaluate(scope, useCache) as number),
};

export default class BinaryExpression implements IExpression
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

    private _operator: BinaryOperator;
    public get operator(): BinaryOperator
    {
        return this._operator;
    }

    /* istanbul ignore next */
    public set operator(value: BinaryOperator)
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
        return NodeType.BinaryExpression;
    }

    public constructor(left: IExpression, right: IExpression, operator: BinaryOperator)
    {
        this._left     = left;
        this._operator = operator;
        this._right    = right;
        this.operation = binaryFunctions[this.operator];
    }

    public clone(): IBinaryExpression
    {
        return new BinaryExpression(this.left.clone(), this.right.clone(), this.operator);
    }

    public evaluate(scope: object, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = this.operation(this.left, this.right, scope as Indexer, !!useCache);
    }

    public toString(): string
    {
        return `${this.left} ${this.operator} ${this.right}`;
    }
}