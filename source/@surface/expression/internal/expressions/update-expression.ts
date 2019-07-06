import { Func1 }          from "@surface/core";
import IExpression        from "../../interfaces/expression";
import NodeType           from "../../node-type";
import { UpdateOperator } from "../../types";
import BaseExpression     from "./abstracts/base-expression";

type Operators = "++*"|"--*"|"*++"|"*--";

const updateFunctions: Record<Operators, Func1<number, number>> =
{
    "++*": value => ++value,
    "--*": value => --value,
    "*++": value => value++,
    "*--": value => value--,
};

export default class UpdateExpression extends BaseExpression<number>
{
    private readonly operation: Func1<number, number>;

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
        super();

        this._argument = argument;
        this._prefix   = prefix;
        this._operator = operator;
        this.operation = (this.prefix ? updateFunctions[`${this.operator}*` as Operators] : updateFunctions[`*${this.operator}` as Operators]);
    }

    public evaluate(): number
    {
        return this.operation(this.argument.evaluate() as number);
    }

    public toString(): string
    {
        return this.prefix ? `${this.operator}${this.argument}` : `${this.argument}${this.operator}`;
    }
}