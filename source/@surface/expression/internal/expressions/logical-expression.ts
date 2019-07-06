import { Func2 }           from "@surface/core";
import IExpression         from "../../interfaces/expression";
import NodeType            from "../../node-type";
import { LogicalOperator } from "../../types";
import BaseExpression      from "./abstracts/base-expression";

const binaryFunctions: Record<LogicalOperator, Func2<IExpression, IExpression, unknown>> =
{
    "&&": (left: IExpression, right: IExpression) => (left.evaluate() as Object) && (right.evaluate() as Object),
    "||": (left: IExpression, right: IExpression) => (left.evaluate() as Object) || (right.evaluate() as Object),
};

export default class LogicalExpression extends BaseExpression
{
    private readonly operation: Func2<IExpression, IExpression, unknown>;

    private _left: IExpression;
    public get left(): IExpression
    {
        return this._left;
    }

    public set left(value: IExpression)
    {
        this._left = value;
    }

    private _operator: LogicalOperator;
    public get operator(): LogicalOperator
    {
        return this._operator;
    }

    public set operator(value: LogicalOperator)
    {
        this._operator = value;
    }

    private _right: IExpression;
    public get right(): IExpression
    {
        return this._right;
    }

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
        super();

        this._left     = left;
        this._operator = operator;
        this._right    = right;
        this.operation = binaryFunctions[this.operator];
    }

    public evaluate(): unknown
    {
        return this._cache = this.operation(this.left, this.right);
    }

    public toString(): string
    {
        return `${this.left.type == NodeType.ConditionalExpression ? `(${this.left})` : this.left} ${this.operator} ${this.right}`;
    }
}