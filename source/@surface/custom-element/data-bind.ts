import { CustomElement } from "./index";
import * as symbols      from "./symbols";

import { Action, Func } from "@surface/types";

enum BindType
{
    attribute = 1,
    text      = 2
}

export class DataBind
{
    private static applyBind(context: object, node: Node, property: string, attribute: string, bindType: BindType, onChange: Action): Action
    {
        let action: Action = () => { };

        if (property.indexOf(".") > -1)
        {
            let childrens = property.split(".");
            property = childrens.pop() || "";
            for (let child of childrens)
            {
                context = context[child];
                if (!context)
                {
                    break;
                }
            }
        }

        let observedAttributes = context.constructor[symbols.observedAttributes] as Array<string>;
        if (observedAttributes && context instanceof CustomElement && observedAttributes.some(x => x == property))
        {
            if (bindType == BindType.attribute)
            {
                action = () => node[attribute] = context[property];
            }

            let onAttributeChanged = context[symbols.onAttributeChanged];
            context[symbols.onAttributeChanged] = function (this: CustomElement, attributeName: string, oldValue: string, newValue: string, namespace: string): void
            {
                if (attributeName == property)
                {
                    onChange();
                }

                if (onAttributeChanged)
                {
                    onAttributeChanged.call(context, attributeName, oldValue, newValue, namespace);
                }
            };
        }
        else
        {
            let descriptor = Object.getOwnPropertyDescriptor(context.constructor.prototype, property);
            if (descriptor)
            {
                if (bindType == BindType.attribute)
                {
                    action = () => node[attribute] = context[property];
                }

                let getter = descriptor.get;
                let setter = descriptor.set;

                Object.defineProperty
                (
                    context,
                    property,
                    {
                        get: () => getter && getter.call(context),
                        set: (value: Object) =>
                        {
                            setter && setter.call(context, value);
                            onChange();
                        }
                    }
                );
            }
        }

        return action;
    }

    private static bindAttribute(context: object, node: Node): void
    {
        let binders: Array<Action> = [];
        let onChange = () => binders.forEach(x => x());

        for (let attribute of node.attributes.asEnumerable())
        {
            if (attribute.value.indexOf("{{") > -1)
            {
                let match    = /{{ *((?:\w+|\.)) *}}/.exec(attribute.value);
                let property = match && match[1] || "";

                if (property)
                {
                    binders.push(DataBind.applyBind(context, node, property, attribute.name, BindType.attribute, onChange));
                }
            }
        }

        onChange();
    }

    private static bindTextNode(context: object, node: Node): void
    {
        let binders: Array<Func<string>> = [];
        let onChange = () => node.nodeValue = binders.map(x => x()).join("");

        if (node.nodeValue && node.nodeValue.indexOf("{{") > -1)
        {
            let groups = node.nodeValue.match(/(.*?)(?:{{ *(?:(\w+|\.)) *}})(.*?)|(.*)/g);
            if (groups && groups.length > 0)
            {
                let matches = groups.map(x => x && /(.*?)(?:{{ *((?:\w|\.)+) *}})(.*?)|(.*)/g.exec(x) || [""]);
                matches.forEach
                (
                    item =>
                    {
                        let [left, property, right, remaining] = item.slice(1);

                        if (property)
                        {
                            this.applyBind(context, node, property, "", BindType.text, onChange);
                        }

                        binders.push(() => `${left || ""}${context[property] || ""}${right || ""}${remaining || ""}`);
                    }
                );

                onChange();
            }
        }
    }

    private static traverseElement(context: object, node: Node): void
    {
        for (const currentNode of Array.from(node.childNodes))
        {
            if (currentNode.attributes && currentNode.attributes.length > 0)
            {
                DataBind.bindAttribute(context, currentNode);
            }

            if (currentNode.nodeType == Node.TEXT_NODE)
            {
                DataBind.bindTextNode(context, currentNode);
            }

            DataBind.traverseElement(context, currentNode);
        }
    }

    public static for<T extends CustomElement>(context: T, content: Node): void
    {
        DataBind.traverseElement(context, content);
    }
}