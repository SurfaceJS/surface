import ExpressionVisitor    from "@surface/expression/expression-visitor";
import IExpression          from "@surface/expression/interfaces/expression";
import MemberExpression     from "@surface/expression/internal/expressions/member-expression";
import Type                 from "@surface/reflection";
import MethodInfo           from "@surface/reflection/method-info";
import PropertyInfo         from "@surface/reflection/property-info";
import { Action, Nullable } from "@surface/types";
import * as symbols         from "../internal/symbols";
import BindingMode          from "./binding-mode";

export default class BindExpressionVisitor extends ExpressionVisitor
{
    private readonly bindingMode: BindingMode;
    private readonly notify:      Nullable<Action>;
    private readonly key:    string;
    private readonly host:        Object;

    public constructor(bindingMode: BindingMode, host: Object, property: string, notify?: Action)
    {
        super();

        this.bindingMode = bindingMode;
        this.notify      = notify;
        this.key    = property;
        this.host        = host;
    }

    private applyBind(target: Object, targetProperty: PropertyInfo|MethodInfo, host: Object, hostProperty: Nullable<PropertyInfo|MethodInfo>): void
    {
        let propagating = false;

        const notify = this.notify;

        const observedAttributes = target.constructor[symbols.observedAttributes] as Array<string>;
        if (observedAttributes && observedAttributes.some(x => x == targetProperty.key))
        {
            const attributeChangedCallback = target["attributeChangedCallback"] as Nullable<Function>;
            target["attributeChangedCallback"] = function (attributeName: string, oldValue: string, newValue: string, namespace: string): void
            {
                if (attributeName == targetProperty.key)
                {
                    if (notify)
                    {
                        notify();
                    }
                }

                if (attributeChangedCallback)
                {
                    attributeChangedCallback.call(target, attributeName, oldValue, newValue, namespace);
                }
            };
        }
        else
        {
            if (targetProperty instanceof PropertyInfo)
            {
                const getter = targetProperty.getter;
                const setter = targetProperty.setter;

                Object.defineProperty
                (
                    target,
                    targetProperty.key,
                    {
                        configurable: true,
                        get: () => getter && getter.call(target),
                        set: (value: Object) =>
                        {
                            if (setter)
                            {
                                setter.call(target, value);

                                if (hostProperty instanceof PropertyInfo && hostProperty.setter)
                                {
                                    hostProperty.setter.call(this.host, value);
                                }

                                if (notify)
                                {
                                    notify();
                                }
                            }
                        }
                    }
                );

                if (hostProperty instanceof PropertyInfo && hostProperty.setter)
                {
                    hostProperty.setter.call(this.host, target[targetProperty.key]);
                }
            }
        }

        if (this.bindingMode == BindingMode.twoWay && hostProperty instanceof PropertyInfo && hostProperty.getter)
        {
            const getter = hostProperty.getter;
            const setter = hostProperty.setter;

            Object.defineProperty
            (
                host,
                hostProperty.key,
                {
                    configurable: true,
                    get: () => getter && getter.call(this.host),
                    set: (value: Object) =>
                    {
                        if (setter)
                        {
                            setter.call(this.host, value);

                            if (targetProperty instanceof PropertyInfo && targetProperty.setter)
                            {
                                targetProperty.setter.call(target, value);
                            }

                            if (target instanceof HTMLElement)
                            {
                                propagating = true;
                                target.dispatchEvent(new Event("change"));
                            }
                        }
                    }
                }
            );
        }

        if (target instanceof HTMLElement)
        {
            target.addEventListener
            (
                "change",
                () =>
                {
                    if (!propagating && hostProperty instanceof PropertyInfo && hostProperty.setter)
                    {
                        hostProperty.setter.call(this.host, target[targetProperty.key]);
                    }

                    propagating = false;

                    if (notify)
                    {
                        notify();
                    }
                }
            );
        }
    }

    protected visitMemberExpression(expression: MemberExpression): IExpression
    {
        const target    = expression.target.evaluate();
        const targetKey = `${expression.property.evaluate()}`;

        if (!target)
        {
            throw new TypeError("Can't bind to non initialized object");
        }

        const hostType    = Type.from(this.host);
        const contextType = Type.from(target);

        const hostProperty   = hostType.getProperty(this.key)     || hostType.getMethod(this.key);
        const targetProperty = contextType.getProperty(targetKey) || contextType.getMethod(targetKey);

        if (targetProperty)
        {
            this.applyBind(target, targetProperty, this.host, hostProperty);
        }
        else
        {
            throw new TypeError("Property does not exist on target object");
        }

        return expression;
    }
}