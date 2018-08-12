import { Func2, ObjectLiteral } from "@surface/core";
import ExpressionType           from "../../expression-type";
import IExpression              from "../../interfaces/expression";
import { UpdateOperator }       from "../../types";
import TypeGuard                from "../type-guard";

type Operators = "++*"|"--*"|"*++"|"*--";

const updateFunctions =
{
    "++*": (target: ObjectLiteral<number>, key: string) => ++target[key],
    "--*": (target: ObjectLiteral<number>, key: string) => --target[key],
    "*++": (target: ObjectLiteral<number>, key: string) => target[key]++,
    "*--": (target: ObjectLiteral<number>, key: string) => target[key]--,
};

export default class UpdateExpression implements IExpression
{
    private readonly operation: Func2<unknown, unknown, number>;

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
        this._expression = expression;
        this._prefix     = prefix;
        this._operator   = operator;
        this.operation   = (this.prefix ? updateFunctions[`${this.operator}*` as Operators] : updateFunctions[`*${this.operator}` as Operators]) as Func2<unknown, unknown, number>;
    }

    public evaluate(): number
    {
        /* istanbul ignore else  */
        if (TypeGuard.isIdentifierExpression(this.expression))
        {
            return this.operation(this.expression.context, this.expression.name);
        }
        else if (TypeGuard.isMemberExpression(this.expression))
        {
            return this.operation(this.expression.target.evaluate(), this.expression.key.evaluate());
        }
        else
        {
            throw new TypeError("Invalid target expression");
        }
    }
}