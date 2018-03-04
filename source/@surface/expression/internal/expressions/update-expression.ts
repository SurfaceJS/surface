import IExpression from "../../interfaces/expression";

import IdentifierExpression from "./identifier-expression";
import MemberExpression     from "./member-expression";

import { Func2, Nullable } from "@surface/types";

const updateFunctions =
{
    "++*": (target: Object, key: string) => ++target[key],
    "--*": (target: Object, key: string) => --target[key],
    "*++": (target: Object, key: string) => target[key]++,
    "*--": (target: Object, key: string) => target[key]--,
};

export default class UpdateExpression implements IExpression
{
    private readonly operation: Func2<Nullable<Object>, Nullable<Object>, number>;

    private readonly _expression: IExpression;
    public get expression(): IExpression
    {
        return this._expression;
    }

    private readonly _operator: string;
    public get operator(): string
    {
        return this._operator;
    }

    private readonly _prefix: boolean;
    public get prefix(): boolean
    {
        return this._prefix;
    }

    public constructor(expression: IExpression, operator: string, prefix: boolean)
    {
        this._expression = expression;
        this._prefix     = prefix;
        this._operator   = operator;
        this.operation   = this.prefix ? updateFunctions[`${this.operator}*`] : updateFunctions[`*${this.operator}`];
    }

    public evaluate(): number
    {
        /* istanbul ignore else  */
        if (this.expression instanceof IdentifierExpression)
        {
            return this.operation(this.expression.context, this.expression.name);
        }
        else if (this.expression instanceof MemberExpression)
        {
            return this.operation(this.expression.target.evaluate(), this.expression.property.evaluate());
        }
        else
        {
            throw new TypeError("Invalid target expression.");
        }
    }
}