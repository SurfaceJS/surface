import { Action, Indexer }     from "@surface/core";
import { coalesce, typeGuard } from "@surface/core/common/generic";
import { dashedToCamel }       from "@surface/core/common/string";
import ExpressionType          from "@surface/expression/expression-type";
import IExpression             from "@surface/expression/interfaces/expression";
import IMemberExpression       from "@surface/expression/interfaces/member-expression";
import Type                    from "@surface/reflection";
import FieldInfo               from "@surface/reflection/field-info";
import PropertyInfo            from "@surface/reflection/property-info";
import IArrayExpression        from "../../expression/interfaces/array-expression";
import BindParser              from "./bind-parser";
import DataBind                from "./data-bind";
import ObserverVisitor         from "./observer-visitor";
import { BINDED, CONTEXT }     from "./symbols";
import windowWrapper           from "./window-wrapper";

type Bindable<T> = Array<T & { [BINDED]?: boolean, [CONTEXT]?: object }>;

export default class ElementBind
{
    private readonly window:  Window;
    private readonly context: object;

    private constructor(context: object)
    {
        this.context = context;
        this.window  = windowWrapper;
    }

    public static for(context: object, content: Node): void
    {
        new ElementBind(context).traverseElement(content);
    }

    public static unbind(content: Node)
    {
        for (const element of Array.from(content.childNodes) as Bindable<Element>)
        {
            if (element[BINDED])
            {
                DataBind.unbind(element);

                element[CONTEXT] = undefined;
                element[BINDED]  = false;

                ElementBind.unbind(element);
            }
        }
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private bindAttribute(element: Element): void
    {
        const notifications: Array<Action> = [];
        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.value.includes("{{") && attribute.value.includes("}}") || attribute.value.includes("[[") && attribute.value.includes("]]"))
            {
                const isOneWay = (attribute.value.startsWith("[[") && attribute.value.endsWith("]]"));
                const isTwoWay = (attribute.value.startsWith("{{") && attribute.value.endsWith("}}"));

                const interpolation = !(isOneWay || isTwoWay);

                const context = this.createProxy({ this: element, ...this.context });

                const expression = BindParser.scan(context, attribute.value);

                if (attribute.name.startsWith("on-"))
                {
                    const action = expression.type == ExpressionType.Identifier || expression.type ==  ExpressionType.Member ?
                        expression.evaluate() as Action
                        : () => expression.evaluate();

                    element.addEventListener(attribute.name.replace(/^on-/, ""), action);
                    attribute.value = `[binding ${action.name || "expression"}]`;
                }
                else
                {
                    const attributeName = dashedToCamel(attribute.name);
                    const elementMember = Type.from(element).getMember(attributeName);

                    const canWrite = elementMember && !(elementMember instanceof PropertyInfo && elementMember.readonly);

                    let notification = () =>
                    {
                        const value = typeGuard<IExpression, IArrayExpression>(expression, x => x.type == ExpressionType.Array) && interpolation ?
                            expression.evaluate().reduce((previous, current) => `${previous}${current}`) :
                            expression.evaluate();

                        if (canWrite)
                        {
                            (element as Indexer)[attributeName] = value;
                        }

                        attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${coalesce(value, "")}`;
                    };

                    if (attributeName in element && isTwoWay && typeGuard<IExpression, IMemberExpression>(expression, x => x.type == ExpressionType.Member))
                    {
                        const target = expression.target.evaluate() as object;
                        const key    = `${expression.key.evaluate()}`;

                        const targetMember = (target instanceof Function) ?
                            Type.of(target).getStaticMember(key) :
                            Type.from(target).getMember(key);

                        if (targetMember)
                        {
                            if (elementMember instanceof FieldInfo && targetMember instanceof FieldInfo && !(elementMember instanceof PropertyInfo && elementMember.readonly || targetMember instanceof PropertyInfo && targetMember.readonly))
                            {
                                notification = () => attribute.value = `${coalesce((target as Indexer)[key], "")}`;

                                (element as Indexer)[attributeName] = expression.evaluate();

                                DataBind.twoWay(element, elementMember, target, targetMember, notification);
                            }
                            else
                            {
                                DataBind.oneWay(target, targetMember, element, notification);
                            }
                        }
                        else
                        {
                            const typeName = target instanceof Function ? target.name : target.constructor.name;
                            throw new Error(`Member ${key} does not exist in type ${typeName}`);
                        }
                    }
                    else
                    {
                        const visitor = new ObserverVisitor(element, notification);
                        visitor.visit(expression);
                    }

                    notifications.push(notification);
                }
            }
        }

        notifications.forEach(notification => notification());
    }

    private bindTextNode(element: Element): void
    {
        if (element.nodeValue && (element.nodeValue.indexOf("{{") > -1 || element.nodeValue.indexOf("[[") > -1))
        {
            const context = this.createProxy({ this: element, ...this.context });

            const expression = BindParser.scan(context, element.nodeValue);

            const notify = typeGuard<IExpression, IArrayExpression>(expression, x => x.type == ExpressionType.Array) ?
                () => element.nodeValue = `${coalesce(expression.evaluate().reduce((previous, current) => `${previous}${current}`), "")}` :
                () => element.nodeValue = `${coalesce(expression.evaluate(), "")}`;

            const visitor = new ObserverVisitor(element, notify);
            visitor.visit(expression);

            notify();
        }
    }

    private createProxy(context: object): object
    {
        const handler: ProxyHandler<Indexer> =
        {
            get: (target, key) => key in target ? target[key as string] : (this.window as Indexer)[key as string],
            has: (target, key) => key in target || key in this.window
        };

        return new Proxy(context, handler);
    }

    private traverseElement(node: Node): void
    {
        for (const element of Array.from(node.childNodes) as Array<Element & { [BINDED]?: boolean, [CONTEXT]?: object }>)
        {
            if (!element[BINDED] && element.tagName != "TEMPLATE")
            {
                element[BINDED]  = true;
                element[CONTEXT] = this.context;

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