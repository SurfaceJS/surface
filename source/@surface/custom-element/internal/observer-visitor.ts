import { Action }        from "@surface/core";
import ExpressionVisitor from "@surface/expression/expression-visitor";
import ICallExpression   from "@surface/expression/interfaces/call-expression";
import IExpression       from "@surface/expression/interfaces/expression";
import IMemberExpression from "@surface/expression/interfaces/member-expression";
import Type              from "@surface/reflection";
import FieldInfo         from "@surface/reflection/field-info";
import DataBind          from "./data-bind";

export default class ObserverVisitor extends ExpressionVisitor
{
    private readonly notify: Action;

    public constructor(notify: Action)
    {
        super();
        this.notify = notify;
    }

    protected visitCallExpression(expression: ICallExpression)
    {
        for (const arg of expression.args)
        {
            super.visit(arg);
        }

        return expression;
    }

    protected visitMemberExpression(expression: IMemberExpression): IExpression
    {
        const target = expression.target.evaluate();
        const key    = `${expression.key.evaluate()}`;

        if (!target)
        {
            throw new TypeError("Can't bind to non initialized object");
        }

        const member = Type.from(target as object).getMember(key);

        if (member instanceof FieldInfo)
        {
            DataBind.oneWay(target as object, member, this.notify);
        }
        else
        {
            this.notify();
        }

        return expression;
    }
}