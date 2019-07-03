import { Func3, Indexer }      from "@surface/core";
import IExpression             from "../../interfaces/expression";
import NodeType                from "../../node-type";
import { AssignmentOpertaror } from "../../types";
import TypeGuard               from "../type-guard";
import BaseExpression          from "./abstracts/base-expression";

const assignmentOperations: Record<AssignmentOpertaror, Func3<Indexer, string|number, unknown, unknown>> =
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
    private readonly _left:     IExpression;
    private readonly _right:    IExpression;
    private readonly _operator: AssignmentOpertaror;

    public get left(): IExpression
    {
        return this._left;
    }

    public get right(): IExpression
    {
        return this._right;
    }

    public get operator(): AssignmentOpertaror
    {
        return this._operator;
    }

    public get type(): NodeType
    {
        return NodeType.Assignment;
    }

    public constructor(left: IExpression, right: IExpression, operator: AssignmentOpertaror)
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
        if (TypeGuard.isIdentifierExpression(this.left))
        {
            return this._cache = this.operation(this.left.context, this.left.name, this.right.evaluate());
        }
        else if (TypeGuard.isMemberExpression(this.left))
        {
            return this._cache = this.operation(this.left.target.evaluate() as Indexer, this.left.key.evaluate() as string|number, this.right.evaluate());
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