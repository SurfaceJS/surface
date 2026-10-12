import type IExpression        from "../interfaces/expression.js";
import NodeType                from "../node-type.js";
import TypeGuard               from "../type-guard.js";
import type { UpdateOperator } from "../types/operators.js";
import type Identifier         from "./identifier.js";
import type MemberExpression   from "./member-expression.js";

type Scope = Record<string | number, number>;

function preIncrement(object: Scope, property: string | number): number
{
    return object[property] = object[property]! + 1;
}

function postIncrement(object: Scope, property: string | number): number
{
    const value = object[property]!;
    object[property] = value + 1;
    return value;
}

function preDecrement(object: Scope, property: string | number): number
{
    return object[property] = object[property]! - 1;
}

function postDecrement(object: Scope, property: string | number): number
{
    const value = object[property]!;
    object[property] = value - 1;
    return value;
}

export default class UpdateExpression implements IExpression
{
    private _argument: Identifier | MemberExpression;
    private _operator: UpdateOperator;
    private _prefix: boolean;

    public get argument(): Identifier | MemberExpression
    {
        return this._argument;
    }

    /* c8 ignore next 4 */
    public set argument(value: Identifier | MemberExpression)
    {
        this._argument = value;
    }

    public get operator(): UpdateOperator
    {
        return this._operator;
    }

    /* c8 ignore next 4 */
    public set operator(value: UpdateOperator)
    {
        this._operator = value;
    }

    public get prefix(): boolean
    {
        return this._prefix;
    }

    /* c8 ignore next 4 */
    public set prefix(value: boolean)
    {
        this._prefix = value;
    }

    public get type(): NodeType
    {
        return NodeType.UpdateExpression;
    }

    public constructor(argument: Identifier | MemberExpression, operator: UpdateOperator, prefix: boolean)
    {
        this._argument = argument;
        this._prefix   = prefix;
        this._operator = operator;
    }

    public clone(): UpdateExpression
    {
        return new UpdateExpression(this.argument.clone(), this.operator, this.prefix);
    }

    public evaluate(scope: object): number
    {
        if (TypeGuard.isIdentifier(this.argument))
        {
            const object   = scope as Scope;
            const property = this.argument.name;

            return this.prefix
                ? (this.operator === "++" ? preIncrement  : preDecrement)(object, property)
                : (this.operator === "++" ? postIncrement : postDecrement)(object, property);
        }

        const object   = this.argument.object.evaluate(scope) as Scope;
        const property = TypeGuard.isIdentifier(this.argument.property) && !this.argument.computed ? this.argument.property.name : this.argument.property.evaluate(scope) as string | number;

        return this.prefix
            ? (this.operator === "++" ? preIncrement  : preDecrement)(object, property)
            : (this.operator === "++" ? postIncrement : postDecrement)(object, property);
    }

    public toString(): string
    {
        return this.prefix ? `${this.operator}${this.argument}` : `${this.argument}${this.operator}`;
    }
}
