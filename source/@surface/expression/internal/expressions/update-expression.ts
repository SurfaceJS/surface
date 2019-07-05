import { Func2, Indexer } from "@surface/core";
import IExpression        from "../../interfaces/expression";
import NodeType           from "../../node-type";
import { UpdateOperator } from "../../types";
import TypeGuard          from "../type-guard";
import BaseExpression     from "./abstracts/base-expression";
import ConstantExpression from "./constant-expression";

type Operators = "++*"|"--*"|"*++"|"*--";

const updateFunctions: Record<Operators, Func2<IExpression, IExpression, number>> =
{
    "++*": (target: IExpression, key: IExpression) => ++(target.evaluate() as Indexer<number>)[key.evaluate() as string]!,
    "--*": (target: IExpression, key: IExpression) => --(target.evaluate() as Indexer<number>)[key.evaluate() as string]!,
    "*++": (target: IExpression, key: IExpression) => (target.evaluate() as Indexer<number>)[key.evaluate() as string]!++,
    "*--": (target: IExpression, key: IExpression) => (target.evaluate() as Indexer<number>)[key.evaluate() as string]!--,
};

export default class UpdateExpression extends BaseExpression<number>
{
    private readonly operation: Func2<IExpression, IExpression, number>;

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
        return NodeType.Update;
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
        /* istanbul ignore else  */
        if (TypeGuard.isIdentifierExpression(this.argument))
        {
            return this._cache = this.operation(new ConstantExpression(this.argument.context), new ConstantExpression(this.argument.name));
        }
        else if (TypeGuard.isMemberExpression(this.argument))
        {
            return this._cache = this.operation(this.argument.object, this.argument.property);
        }
        else
        {
            throw new TypeError("Invalid target expression");
        }
    }

    public toString(): string
    {
        return this.prefix ? `${this.operator}${this.argument}` : `${this.argument}${this.operator}`;
    }
}