import { Func2, Indexer } from "@surface/core";
import ExpressionType     from "../../expression-type";
import IExpression        from "../../interfaces/expression";
import { UpdateOperator } from "../../types";
import TypeGuard          from "../type-guard";
import BaseExpression     from "./abstracts/base-expression";
import ConstantExpression from "./constant-expression";

type Operators = "++*"|"--*"|"*++"|"*--";

const updateFunctions =
{
    "++*": (target: IExpression, key: IExpression) => ++(target.evaluate() as Indexer<number>)[key.evaluate() as string]!,
    "--*": (target: IExpression, key: IExpression) => --(target.evaluate() as Indexer<number>)[key.evaluate() as string]!,
    "*++": (target: IExpression, key: IExpression) => (target.evaluate() as Indexer<number>)[key.evaluate() as string]!++,
    "*--": (target: IExpression, key: IExpression) => (target.evaluate() as Indexer<number>)[key.evaluate() as string]!--,
};

export default class UpdateExpression extends BaseExpression<number>
{
    private readonly operation: Func2<IExpression, IExpression, number>;

    private readonly _expression: IExpression;
    public get expression(): IExpression
    {
        return this._expression;
    }

    private readonly _operator: UpdateOperator;
    public get operator(): UpdateOperator
    {
        return this._operator;
    }

    private readonly _prefix: boolean;
    public get prefix(): boolean
    {
        return this._prefix;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Update;
    }

    public constructor(expression: IExpression, operator: UpdateOperator, prefix: boolean)
    {
        super();

        this._expression = expression;
        this._prefix     = prefix;
        this._operator   = operator;
        this.operation   = (this.prefix ? updateFunctions[`${this.operator}*` as Operators] : updateFunctions[`*${this.operator}` as Operators]);
    }

    public evaluate(): number
    {
        /* istanbul ignore else  */
        if (TypeGuard.isIdentifierExpression(this.expression))
        {
            return this._cache = this.operation(new ConstantExpression(this.expression.context), new ConstantExpression(this.expression.name));
        }
        else if (TypeGuard.isMemberExpression(this.expression))
        {
            return this._cache = this.operation(this.expression.target, this.expression.key);
        }
        else
        {
            throw new TypeError("Invalid target expression");
        }
    }
}