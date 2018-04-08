import ExpressionVisitor from "@surface/expression/expression-visitor";
import IExpression       from "@surface/expression/interfaces/expression";
import MemberExpression  from "@surface/expression/internal/expressions/member-expression";
import { Action }        from "@surface/types";
import DataBind          from "./data-bind";

export default class BindExpressionVisitor extends ExpressionVisitor
{
    private readonly notify: Action;

    public constructor(notify: Action)
    {
        super();
        this.notify = notify;
    }

    protected visitMemberExpression(expression: MemberExpression): IExpression
    {
        const target = expression.target.evaluate();
        const key    = `${expression.key.evaluate()}`;

        if (!target)
        {
            throw new TypeError("Can't bind to non initialized object");
        }

        DataBind.oneWay(target, key, this.notify);

        return expression;
    }
}