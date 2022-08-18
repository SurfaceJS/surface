import type IExpression        from "../interfaces/expression";
import NodeType                from "../node-type.js";
import TypeGuard               from "../type-guard.js";
import type { UpdateOperator } from "../types/operators";
import type Identifier         from "./identifier.js";
import type MemberExpression   from "./member-expression.js";

type Operation = (object: Record<string | number, number>, property: string | number) => number;
type Operators = "++*" | "--*" | "*++" | "*--";

const updateFunctions: Record<Operators, Operation> =
{
    "*++": (object, property) => object[property]++,
    "*--": (object, property) => object[property]--,
    "++*": (object, property) => ++object[property],
    "--*": (object, property) => --object[property],
};

export default class UpdateExpression implements IExpression
{
    private readonly operation: Operation;

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
        this.operation = this.prefix ? updateFunctions[`${this.operator}*` as Operators] : updateFunctions[`*${this.operator}` as Operators];
    }

    public clone(): UpdateExpression
    {
        return new UpdateExpression(this.argument.clone(), this.operator, this.prefix);
    }

    public evaluate(scope: object): number
    {
        if (TypeGuard.isIdentifier(this.argument))
        {
            return this.operation(scope as Record<string | number, number>, this.argument.name);
        }

        const object   = this.argument.object.evaluate(scope) as Record<string | number, number>;
        const property = TypeGuard.isIdentifier(this.argument.property) && !this.argument.computed ? this.argument.property.name : this.argument.property.evaluate(scope) as string | number;

        return this.operation(object, property);
    }

    public toString(): string
    {
        return this.prefix ? `${this.operator}${this.argument}` : `${this.argument}${this.operator}`;
    }
}