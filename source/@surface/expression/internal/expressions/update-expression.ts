import { Indexer, Nullable } from "@surface/core";
import { hasValue }          from "@surface/core/common/generic";
import IExpression           from "../../interfaces/expression";
import IIdentifier           from "../../interfaces/identifier";
import IMemberExpression     from "../../interfaces/member-expression";
import IUpdateExpression     from "../../interfaces/update-expression";
import NodeType              from "../../node-type";
import { UpdateOperator }    from "../../types";
import TypeGuard             from "../type-guard";

type Operation = (object: Record<string|number, number>, property: string|number) => number;
type Operators = "++*"|"--*"|"*++"|"*--";

const updateFunctions: Record<Operators, Operation> =
{
    "++*": (object, property) => ++object[property],
    "--*": (object, property) => --object[property],
    "*++": (object, property) => object[property]++,
    "*--": (object, property) => object[property]--,
};

export default class UpdateExpression implements IExpression
{
    private readonly operation: Operation;

    private cache: Nullable<number>;

    private _argument: IIdentifier|IMemberExpression;
    public get argument(): IIdentifier|IMemberExpression
    {
        return this._argument;
    }

    /* istanbul ignore next */
    public set argument(value: IIdentifier|IMemberExpression)
    {
        this._argument = value;
    }

    private _operator: UpdateOperator;
    public get operator(): UpdateOperator
    {
        return this._operator;
    }

    /* istanbul ignore next */
    public set operator(value: UpdateOperator)
    {
        this._operator = value;
    }

    private _prefix: boolean;
    public get prefix(): boolean
    {
        return this._prefix;
    }

    /* istanbul ignore next */
    public set prefix(value: boolean)
    {
        this._prefix = value;
    }

    public get type(): NodeType
    {
        return NodeType.UpdateExpression;
    }

    public constructor(argument: IIdentifier|IMemberExpression, operator: UpdateOperator, prefix: boolean)
    {
        this._argument = argument;
        this._prefix   = prefix;
        this._operator = operator;
        this.operation = (this.prefix ? updateFunctions[`${this.operator}*` as Operators] : updateFunctions[`*${this.operator}` as Operators]);
    }

    public clone(): IUpdateExpression
    {
        return new UpdateExpression(this.argument.clone(), this.operator, this.prefix);
    }

    public evaluate(scope: Indexer, useCache?: boolean): number
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        if (TypeGuard.isIdentifier(this.argument))
        {
            return this.cache = this.operation(scope as Record<string|number, number>, this.argument.name);
        }
        else
        {
            const object   = this.argument.object.evaluate(scope, useCache) as Record<string|number, number>;
            const property = TypeGuard.isIdentifier(this.argument.property) && !this.argument.computed ? this.argument.property.name : this.argument.property.evaluate(scope, useCache) as string|number;

            return this.cache = this.operation(object, property);
        }
    }

    public toString(): string
    {
        return this.prefix ? `${this.operator}${this.argument}` : `${this.argument}${this.operator}`;
    }
}