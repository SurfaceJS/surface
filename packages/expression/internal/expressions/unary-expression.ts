import type { Delegate, Indexer } from "@surface/core";
import type IExpression           from "../interfaces/expression";
import NodeType                   from "../node-type.js";
import type { UnaryOperator }     from "../types/operators";

type Operation = (value: IExpression, scope: Indexer) => Object;

const unaryFunctions: Record<UnaryOperator, Operation> =
{
    "!":      (expression, scope) => !expression.evaluate(scope),
    "+":      (expression, scope) => +(expression.evaluate(scope) as Object),
    "-":      (expression, scope) => -(expression.evaluate(scope) as Object),
    "typeof": (expression, scope) => typeof expression.evaluate(scope),
    "~":      (expression, scope) => ~(expression.evaluate(scope) as Object),
};

export default class UnaryExpression implements IExpression
{
    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    /* c8 ignore next 4 */
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

    /* c8 ignore next 4 */
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
        this.operation = unaryFunctions[this.operator] as Delegate<[unknown], Object>;
    }

    public clone(): UnaryExpression
    {
        return new UnaryExpression(this.argument.clone(), this.operator);
    }

    public evaluate(scope: object): Object
    {
        return this.operation(this.argument, scope as Indexer);
    }

    public toString(): string
    {
        return `${this.operator}${this.operator == "typeof" ? " " : ""}${this.argument}`;
    }
}