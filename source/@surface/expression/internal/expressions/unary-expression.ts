import { Func1, Indexer, Nullable, hasValue } from "@surface/core";
import IExpression                            from "../interfaces/expression";
import IUnaryExpression                       from "../interfaces/unary-expression";
import NodeType                               from "../node-type";
import { UnaryOperator }                      from "../types";

type Operation = (value: IExpression, scope: Indexer, useCache: boolean) => Object;

const unaryFunctions: Record<UnaryOperator, Operation> =
{
    "+":      (expression, scope, useCache) => +(expression.evaluate(scope, useCache) as Object),
    "-":      (expression, scope, useCache) => -(expression.evaluate(scope, useCache) as Object),
    "~":      (expression, scope, useCache) => ~(expression.evaluate(scope, useCache) as Object),
    "!":      (expression, scope, useCache) => !expression.evaluate(scope, useCache),
    "typeof": (expression, scope, useCache) => typeof expression.evaluate(scope, useCache),
};

export default class UnaryExpression implements IExpression
{
    private cache: Nullable<Object>;

    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    /* istanbul ignore next */
    public set argument(value: IExpression)
    {
        this._argument = value;
    }

    private readonly operation: Operation;

    private _operator: UnaryOperator;
    public get operator(): UnaryOperator
    {
        return this._operator;
    }

    /* istanbul ignore next */
    public set operator(value: UnaryOperator)
    {
        this._operator = value;
    }

    public get type(): NodeType
    {
        return NodeType.UnaryExpression;
    }

    public constructor(argument: IExpression, operator: UnaryOperator)
    {
        this._operator = operator;
        this._argument = argument;
        this.operation = unaryFunctions[this.operator] as Func1<unknown, Object>;
    }

    public clone(): IUnaryExpression
    {
        return new UnaryExpression(this.argument.clone(), this.operator);
    }

    public evaluate(scope: object, useCache?: boolean): Object
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = this.operation(this.argument, scope as Indexer, !!useCache);
    }

    public toString(): string
    {
        return `${this.operator}${this.operator == "typeof" ? " ": ""}${this.argument}`;
    }
}