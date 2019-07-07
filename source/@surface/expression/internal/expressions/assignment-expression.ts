import { Func3, Indexer }     from "@surface/core";
import { hasValue }           from "@surface/core/common/generic";
import IExpression            from "../../interfaces/expression";
import NodeType               from "../../node-type";
import { AssignmentOperator } from "../../types";
import TypeGuard              from "../type-guard";

const assignmentOperations: Record<AssignmentOperator, Func3<Indexer, string|number, unknown, unknown>> =
{
    "%=":   (target, key, value) => (target[key] as number) %=   value as number,
    "&=":   (target, key, value) => (target[key] as number) &=   value as number,
    "**=":  (target, key, value) => (target[key] as number) **=  value as number,
    "*=":   (target, key, value) => (target[key] as number) *=   value as number,
    "+=":   (target, key, value) => (target[key] as number) +=   value as number,
    "-=":   (target, key, value) => (target[key] as number) -=   value as number,
    "/=":   (target, key, value) => (target[key] as number) /=   value as number,
    "<<=":  (target, key, value) => (target[key] as number) <<=  value as number,
    "=":    (target, key, value) => target[key]               =  value,
    ">>=":  (target, key, value) => (target[key] as number) >>=  value as number,
    ">>>=": (target, key, value) => (target[key] as number) >>>= value as number,
    "^=":   (target, key, value) => (target[key] as number) ^=   value as number,
    "|=":   (target, key, value) => (target[key] as number) |=   value as number,
};

export default class AssignmentExpression implements IExpression
{
    private readonly operation: Func3<Indexer, string|number, unknown, unknown>;

    private cache: unknown;

    private _left:     IExpression;
    public get left(): IExpression
    {
        return this._left;
    }

    public set left(value: IExpression)
    {
        this._left = value;
    }

    private _operator: AssignmentOperator;
    public get operator(): AssignmentOperator
    {
        return this._operator;
    }

    public set operator(value: AssignmentOperator)
    {
        this._operator = value;
    }

    private _right:    IExpression;
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
        return NodeType.AssignmentExpression;
    }

    public constructor(left: IExpression, right: IExpression, operator: AssignmentOperator)
    {
        this._left     = left;
        this._right    = right;
        this._operator = operator;

        this.operation = assignmentOperations[operator];
    }

    public evaluate(scope: Indexer, useChache: boolean): unknown
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        /* istanbul ignore else  */
        if (TypeGuard.isIdentifier(this.left))
        {
            return this.cache = this.operation(scope, this.left.name, this.right.evaluate(scope, useChache));
        }
        else if (TypeGuard.isMemberExpression(this.left))
        {
            return this.cache = this.operation(this.left.object.evaluate(scope, useChache) as Indexer, this.left.property.evaluate(scope, useChache) as string|number, this.right.evaluate(scope, useChache));
        }
        else
        {
            throw new TypeError("Invalid left expression");
        }
    }

    public toString(): string
    {
        return `${this.left} ${this.operator} ${this.right}`;
    }
}