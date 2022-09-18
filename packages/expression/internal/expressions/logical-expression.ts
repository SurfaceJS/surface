import type { Indexer }         from "@surface/core";
import type IExpression         from "../interfaces/expression.js";
import NodeType                 from "../node-type.js";
import type { LogicalOperator } from "../types/operators.js";

type Operation = (left: IExpression, right: IExpression, scope: Indexer) => unknown;

const binaryFunctions: Record<LogicalOperator, Operation> =
{
    "&&": (left, right, scope) => (left.evaluate(scope) as Object) && (right.evaluate(scope) as Object),
    "??": (left, right, scope) => (left.evaluate(scope) as Object) ?? (right.evaluate(scope) as Object),
    "||": (left, right, scope) => (left.evaluate(scope) as Object) || (right.evaluate(scope) as Object),
};

export default class LogicalExpression implements IExpression
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

    private _operator: LogicalOperator;
    public get operator(): LogicalOperator
    {
        return this._operator;
    }

    /* c8 ignore next 4 */
    public set operator(value: LogicalOperator)
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
        return NodeType.LogicalExpression;
    }

    public constructor(left: IExpression, right: IExpression, operator: LogicalOperator)
    {
        this._left     = left;
        this._operator = operator;
        this._right    = right;
        this.operation = binaryFunctions[this.operator];
    }

    public clone(): LogicalExpression
    {
        return new LogicalExpression(this.left.clone(), this.right.clone(), this.operator);
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