import { Func1, Indexer, Nullable } from "@surface/core";
import { hasValue }                 from "@surface/core/common/generic";
import IExpression                  from "../../interfaces/expression";
import NodeType                     from "../../node-type";
import { UpdateOperator }           from "../../types";

type Operators = "++*"|"--*"|"*++"|"*--";

const updateFunctions: Record<Operators, Func1<number, number>> =
{
    "++*": value => ++value,
    "--*": value => --value,
    "*++": value => value++,
    "*--": value => value--,
};

export default class UpdateExpression implements IExpression
{
    private readonly operation: Func1<number, number>;

    private cache: Nullable<number>;

    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    public set argument(value: IExpression)
    {
        this._argument = value;
    }

    private _operator: UpdateOperator;
    public get operator(): UpdateOperator
    {
        return this._operator;
    }

    public set operator(value: UpdateOperator)
    {
        this._operator = value;
    }

    private _prefix: boolean;
    public get prefix(): boolean
    {
        return this._prefix;
    }

    public set prefix(value: boolean)
    {
        this._prefix = value;
    }

    public get type(): NodeType
    {
        return NodeType.UpdateExpression;
    }

    public constructor(argument: IExpression, operator: UpdateOperator, prefix: boolean)
    {
        this._argument = argument;
        this._prefix   = prefix;
        this._operator = operator;
        this.operation = (this.prefix ? updateFunctions[`${this.operator}*` as Operators] : updateFunctions[`*${this.operator}` as Operators]);
    }

    public evaluate(scope: Indexer, useCache: boolean): number
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = this.operation(this.argument.evaluate(scope, useCache) as number);
    }

    public toString(): string
    {
        return this.prefix ? `${this.operator}${this.argument}` : `${this.argument}${this.operator}`;
    }
}