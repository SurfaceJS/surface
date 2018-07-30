import { Action }          from "@surface/core";
import { coalesce }        from "@surface/core/common/generic";
import { dashedToCamel }   from "@surface/core/common/string";
import ExpressionType      from "@surface/expression/expression-type";
import IMemberExpression   from "@surface/expression/interfaces/member-expression";
import Type                from "@surface/reflection";
import IArrayExpression    from "../../expression/interfaces/array-expression";
import BindParser          from "./bind-parser";
import BindingMode         from "./binding-mode";
import DataBind            from "./data-bind";
import ObserverVisitor     from "./observer-visitor";
import { binded, context } from "./symbols";
import windowWrapper       from "./window-wrapper";

export default class ElementBind
{
    private readonly window:  Window;
    private readonly context: Object;

    private constructor(context: Object)
    {
        this.context = context;
        this.window  = windowWrapper;
    }

    public static for(context: Object, content: Node): void
    {
        new ElementBind(context).traverseElement(content);
    }

    private bindAttribute(element: Element): void
    {
        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.value.includes("{{") || attribute.value.includes("[["))
            {
                const interpolation = !(attribute.value.startsWith("{{") && attribute.value.endsWith("}}"))
                    && !(attribute.value.startsWith("[[") && attribute.value.endsWith("]]"));

                const context = this.createProxy({ this: element, ...this.context });

                const { bindingMode, expression } = BindParser.scan(context, attribute.value);

                if (attribute.name.startsWith("on-"))
                {
                    let action: Action;
                    if (expression.type == ExpressionType.Member)
                    {
                        action = expression.evaluate() as Action;
                    }
                    else
                    {
                        action = () => expression.evaluate();
                    }

                    element.addEventListener(attribute.name.replace(/^on-/, ""), action);
                    attribute.value = `[binding ${action.name || "expression"}]`;
                }
                else
                {
                    const attributeName = dashedToCamel(attribute.name);

                    let notify = () =>
                    {
                        const value = expression.type == ExpressionType.Array && interpolation ?
                            (expression as IArrayExpression).evaluate().reduce((previous, current) => `${previous}${current}`) :
                            expression.evaluate();

                        attribute.value = `${coalesce(value, "")}`;

                        if (attributeName in element)
                        {
                            element[attributeName] = value;
                        }
                    };

                    if (bindingMode == BindingMode.twoWay)
                    {
                        const source = attributeName in element ? element : attribute;

                        const leftProperty = attributeName in element ?
                            Type.from(element).getProperty(attributeName) :
                            Type.from(attribute).getProperty("value");

                        const target = (expression as IMemberExpression).target.evaluate() as Object;
                        const key    = `${(expression as IMemberExpression).key.evaluate()}`;

                        const rightProperty = (target instanceof Function) ?
                            Type.of(target).getStaticProperty(attributeName) :
                            Type.from(target).getProperty(key);

                        if (leftProperty && rightProperty)
                        {
                            notify = () => attribute.value = `${coalesce(expression.evaluate(), "")}`;

                            if (leftProperty.setter)
                            {
                                leftProperty.setter.call(source, expression.evaluate());
                            }

                            DataBind.twoWay(source, leftProperty, target, rightProperty);
                        }
                        else if (rightProperty)
                        {
                            DataBind.oneWay(target, rightProperty, notify);
                        }
                    }
                    else
                    {
                        const visitor = new ObserverVisitor(notify);
                        visitor.visit(expression);
                    }

                    notify();
                }
            }
        }
    }

    private bindTextNode(element: Element): void
    {
        if (element.nodeValue && (element.nodeValue.indexOf("{{") > -1 || element.nodeValue.indexOf("[[") > -1))
        {
            const context = this.createProxy({ this: element, ...this.context });

            let expression = BindParser.scan(context, element.nodeValue).expression;

            const notify = expression.type == ExpressionType.Array ?
                () => element.nodeValue = `${coalesce((expression as IArrayExpression).evaluate().reduce((previous, current) => `${previous}${current}`), "")}` :
                () => element.nodeValue = `${coalesce(expression.evaluate(), "")}`;

            const visitor = new ObserverVisitor(notify);
            visitor.visit(expression);

            notify();
        }
    }

    private createProxy(context: Object): Object
    {
        const handler: ProxyHandler<Object> =
        {
            get: (target, key) => key in target ? target[key] : this.window[key],
            has: (target, key) => key in target || key in this.window
        };

        return new Proxy(context, handler);
    }

    private traverseElement(node: Node): void
    {
        for (const element of Array.from(node.childNodes) as Array<Element>)
        {
            if (!element[binded] && element.tagName != "TEMPLATE")
            {
                element[binded]  = true;
                element[context] = this.context;

                if (element.attributes && element.attributes.length > 0)
                {
                    this.bindAttribute(element);
                }

                if (element.nodeType == Node.TEXT_NODE)
                {
                    this.bindTextNode(element);
                }

                this.traverseElement(element);
            }
        }
    }
}