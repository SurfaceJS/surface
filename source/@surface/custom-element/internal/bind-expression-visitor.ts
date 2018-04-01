import ExpressionVisitor    from "@surface/expression/expression-visitor";
import IExpression          from "@surface/expression/interfaces/expression";
import MemberExpression     from "@surface/expression/internal/expressions/member-expression";
import Type                 from "@surface/reflection";
import PropertyInfo         from "@surface/reflection/property-info";
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

    private listen(target: Object, property: PropertyInfo): void
    {
        const notify = this.notify;

        const observedAttributes = target.constructor[symbols.observedAttributes] as Array<string>;
        if (observedAttributes && observedAttributes.some(x => x == property.key))
        {
            const attributeChangedCallback = target["attributeChangedCallback"] as Nullable<Function>;
            target["attributeChangedCallback"] = function (attributeName: string, oldValue: string, newValue: string, namespace: string): void
            {
                if (attributeName == property.key)
                {
                    notify();
                }

                if (attributeChangedCallback)
                {
                    attributeChangedCallback.call(target, attributeName, oldValue, newValue, namespace);
                }
            };
        }
        else
        {
            const getter = property.getter;
            const setter = property.setter;

            Object.defineProperty
            (
                target,
                property.key,
                {
                    configurable: true,
                    get: () => getter && getter.call(target),
                    set: (value: Object) =>
                    {
                        if (setter)
                        {
                            setter.call(target, value);

                            notify();
                        }
                    }
                }
            );
        }

        if (target instanceof HTMLElement)
        {
            target.addEventListener("change", notify);
        }
    }

    protected visitMemberExpression(expression: MemberExpression): IExpression
    {
        const target = expression.target.evaluate();
        const key    = `${expression.key.evaluate()}`;

        if (!target)
        {
            throw new TypeError("Can't bind to non initialized object");
        }

        const property = Type.from(target).getProperty(key);

        if (property)
        {
            this.listen(target, property);
        }

        return expression;
    }
}