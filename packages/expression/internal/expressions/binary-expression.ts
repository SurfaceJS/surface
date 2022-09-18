import type { Indexer }        from "@surface/core";
import type IExpression        from "../interfaces/expression.js";
import NodeType                from "../node-type.js";
import type { BinaryOperator } from "../types/operators.js";

type Operation = (left: IExpression, right: IExpression, scope: Indexer) => unknown;

const binaryFunctions: Record<BinaryOperator, Operation> =
{
    "!=":         (left, right, scope) => (left.evaluate(scope) as Object)  !=         (right.evaluate(scope) as Object),
    "!==":        (left, right, scope) => (left.evaluate(scope) as Object)  !==        (right.evaluate(scope) as Object),
    "%":          (left, right, scope) => (left.evaluate(scope) as number)  %          (right.evaluate(scope) as number),
    "&":          (left, right, scope) => (left.evaluate(scope) as number)  &          (right.evaluate(scope) as number),
    "*":          (left, right, scope) => (left.evaluate(scope) as number)  *          (right.evaluate(scope) as number),
    "**":         (left, right, scope) => (left.evaluate(scope) as number)  **         (right.evaluate(scope) as number),
    "+":          (left, right, scope) => (left.evaluate(scope) as number)  +          (right.evaluate(scope) as number),
    "-":          (left, right, scope) => (left.evaluate(scope) as number)  -          (right.evaluate(scope) as number),
    "/":          (left, right, scope) => (left.evaluate(scope) as number)  /          (right.evaluate(scope) as number),
    "<":          (left, right, scope) => (left.evaluate(scope) as Object)  <          (right.evaluate(scope) as Object),
    "<<":         (left, right, scope) => (left.evaluate(scope) as number)  <<         (right.evaluate(scope) as number),
    "<=":         (left, right, scope) => (left.evaluate(scope) as Object)  <=         (right.evaluate(scope) as Object),
    "==":         (left, right, scope) => (left.evaluate(scope) as Object)  ==         (right.evaluate(scope) as Object),
    "===":        (left, right, scope) => (left.evaluate(scope) as Object)  ===        (right.evaluate(scope) as Object),
    ">":          (left, right, scope) => (left.evaluate(scope) as Object)  >          (right.evaluate(scope) as Object),
    ">=":         (left, right, scope) => (left.evaluate(scope) as Object)  >=         (right.evaluate(scope) as Object),
    ">>":         (left, right, scope) => (left.evaluate(scope) as number)  >>         (right.evaluate(scope) as number),
    ">>>":        (left, right, scope) => (left.evaluate(scope) as number)  >>>        (right.evaluate(scope) as number),
    "^":          (left, right, scope) => (left.evaluate(scope) as number)  ^          (right.evaluate(scope) as number),
    "in":         (left, right, scope) => (left.evaluate(scope) as string)  in         (right.evaluate(scope) as Function),
    "instanceof": (left, right, scope) => (left.evaluate(scope) as Object)  instanceof (right.evaluate(scope) as Function),
    "|":          (left, right, scope) => (left.evaluate(scope) as number)  |          (right.evaluate(scope) as number),
};

export default class BinaryExpression implements IExpression
{
    private readonly operation: Operation;

    private _left: IExpression;
    public get left(): IExpression
    {
        return this._left;
    }

    /* c8 ignore next 4 */
    public set left(value: IExpression)
    {
        this._left = value;
    }

    private _operator: BinaryOperator;
    public get operator(): BinaryOperator
    {
        return this._operator;
    }

    /* c8 ignore next 4 */
    public set operator(value: BinaryOperator)
    {
        this._operator = value;
    }

    private _right: IExpression;
    public get right(): IExpression
    {
        return this._right;
    }

    /* c8 ignore next 4 */
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

    public clone(): BinaryExpression
    {
        return new BinaryExpression(this.left.clone(), this.right.clone(), this.operator);
    }

    public evaluate(scope: object): unknown
    {
        return this.operation(this.left, this.right, scope as Indexer);
    }

    public toString(): string
    {
        return `${this.left} ${this.operator} ${this.right}`;
    }
}