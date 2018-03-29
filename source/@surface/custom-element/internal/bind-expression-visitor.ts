import ExpressionVisitor    from "@surface/expression/expression-visitor";
import IExpression          from "@surface/expression/interfaces/expression";
import MemberExpression     from "@surface/expression/internal/expressions/member-expression";
import { Action, Nullable } from "@surface/types";
import * as symbols         from "../internal/symbols";

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
        const context  = expression.target.evaluate();
        const property = expression.property.evaluate() as Nullable<string>;

        if (!context || !property)
        {
            throw new TypeError("Can't bind to non initialized object");
        }

        const notify = this.notify;

        const observedAttributes = context.constructor[symbols.observedAttributes] as Array<string>;
        if (observedAttributes && observedAttributes.some(x => x == property))
        {
            const attributeChangedCallback = context["attributeChangedCallback"] as Nullable<Function>;
            context["attributeChangedCallback"] = function (this: Object, attributeName: string, oldValue: string, newValue: string, namespace: string): void
            {
                if (attributeName == property)
                {
                    notify();
                }

                if (attributeChangedCallback)
                {
                    attributeChangedCallback.call(context, attributeName, oldValue, newValue, namespace);
                }
            };
        }
        else
        {
            let descriptor = Object.getOwnPropertyDescriptor(context.constructor.prototype, property);
            if (descriptor && descriptor.get)
            {
                let getter = descriptor.get;
                let setter = descriptor.set;

                Object.defineProperty
                (
                    context,
                    property,
                    {
                        configurable: true,
                        get: () => getter && getter.call(context),
                        set: (value: Object) =>
                        {
                            if (setter)
                            {
                                setter.call(context, value);
                                notify();
                            }
                        }
                    }
                );
            }
        }

        return expression;
    }
}