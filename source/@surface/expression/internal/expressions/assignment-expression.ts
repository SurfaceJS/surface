import { Func3, Indexer }      from "@surface/core";
import IExpression             from "../../interfaces/expression";
import NodeType                from "../../node-type";
import { AssignmentOperator } from "../../types";
import TypeGuard               from "../type-guard";
import BaseExpression          from "./abstracts/base-expression";

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

export default class AssignmentExpression extends BaseExpression
{
    private readonly operation: Func3<Indexer, string|number, unknown, unknown>;

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
        super();

        this._left     = left;
        this._right    = right;
        this._operator = operator;

        this.operation = assignmentOperations[operator];
    }

    public evaluate(): unknown
    {
        /* istanbul ignore else  */
        if (TypeGuard.isIdentifier(this.left))
        {
            return this._cache = this.operation(this.left.scope, this.left.name, this.right.evaluate());
        }
        else if (TypeGuard.isMemberExpression(this.left))
        {
            return this._cache = this.operation(this.left.object.evaluate() as Indexer, this.left.property.evaluate() as string|number, this.right.evaluate());
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