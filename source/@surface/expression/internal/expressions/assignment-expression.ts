import type { Delegate, Indexer }  from "@surface/core";
import { hasValue }                from "@surface/core";
import type IAssignmentExpression  from "../interfaces/assignment-expression";
import type IExpression            from "../interfaces/expression";
import type IIdentifier            from "../interfaces/identifier";
import type IMemberExpression      from "../interfaces/member-expression";
import NodeType                    from "../node-type.js";
import TypeGuard                   from "../type-guard.js";
import type { AssignmentOperator } from "../types/operators";

const assignmentOperations: Record<AssignmentOperator, Delegate<[Indexer, string | number, unknown], unknown>> =
{
    "%=":   (target, key, value) => (target[key] as number) %=   value as number,
    "&&=":  (target, key, value) => target[key]             &&=  value,
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
    "??=":  (target, key, value) => target[key]             ??=  value,
    "^=":   (target, key, value) => (target[key] as number) ^=   value as number,
    "|=":   (target, key, value) => (target[key] as number) |=   value as number,
    "||=":  (target, key, value) => target[key]             ||=  value,
};

export default class AssignmentExpression implements IExpression
{
    private readonly operation: Delegate<[Indexer, string | number, unknown], unknown>;

    private cache: unknown;

    private _left:     IIdentifier | IMemberExpression;
    public get left(): IIdentifier | IMemberExpression
    {
        return this._left;
    }

    /* c8 ignore next 4 */
    public set left(value: IIdentifier | IMemberExpression)
    {
        this._left = value;
    }

    private _operator: AssignmentOperator;
    public get operator(): AssignmentOperator
    {
        return this._operator;
    }

    /* c8 ignore next 4 */
    public set operator(value: AssignmentOperator)
    {
        this._operator = value;
    }

    private _right:    IExpression;
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
        return NodeType.AssignmentExpression;
    }

    public constructor(left: IIdentifier | IMemberExpression, right: IExpression, operator: AssignmentOperator)
    {
        this._left     = left;
        this._right    = right;
        this._operator = operator;

        this.operation = assignmentOperations[operator];
    }

    public clone(): IAssignmentExpression
    {
        return new AssignmentExpression(this.left.clone(), this.right.clone(), this.operator);
    }

    public evaluate(scope: object, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        if (TypeGuard.isIdentifier(this.left))
        {
            return this.cache = this.operation(scope as Indexer, this.left.name, this.right.evaluate(scope, useCache));
        }

        const object   = this.left.object.evaluate(scope, useCache) as Indexer;
        const property = TypeGuard.isIdentifier(this.left.property) && !this.left.computed ? this.left.property.name : this.left.property.evaluate(scope, useCache) as string | number;

        return this.cache = this.operation(object, property, this.right.evaluate(scope, useCache));
    }

    public toString(): string
    {
        return `${this.left} ${this.operator} ${this.right}`;
    }
}