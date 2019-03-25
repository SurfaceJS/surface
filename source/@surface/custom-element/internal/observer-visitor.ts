import { Action1, Indexer, Nullable } from "@surface/core";
import ExpressionVisitor              from "@surface/expression/expression-visitor";
import ICallExpression                from "@surface/expression/interfaces/call-expression";
import IExpression                    from "@surface/expression/interfaces/expression";
import IMemberExpression              from "@surface/expression/interfaces/member-expression";
import Type                           from "@surface/reflection";
import FieldInfo                      from "@surface/reflection/field-info";
import DataBind                       from "./data-bind";

export default class ObserverVisitor extends ExpressionVisitor
{
    private readonly notify: Action1<unknown>;

    public constructor(notify: Action1<unknown>)
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
        const target = expression.target.evaluate() as Nullable<Indexer>;
        const key    = `${expression.key.evaluate()}`;

        if (target)
        {
            const member = Type.from(target).getMember(key);

            if (member instanceof FieldInfo)
            {
                DataBind.oneWay(target, key, { notify: this.notify });
            }
            else
            {
                this.notify(target[key]);
            }

            return expression;
        }
        else
        {
            throw new TypeError("Can't bind to non initialized object");
        }
    }
}