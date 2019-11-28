import { Action, Action1, Indexer }      from "@surface/core";
import { typeGuard }                     from "@surface/core/common/generic";
import { dashedToCamel }                 from "@surface/core/common/string";
import NodeType                          from "@surface/expression/node-type";
import Type                              from "@surface/reflection";
import FieldInfo                         from "@surface/reflection/field-info";
import { createProxy, pushSubscription } from "./common";
import DataBind                          from "./data-bind";
import DirectiveProcessor                from "./directive-processor";
import InterpolatedExpression            from "./interpolated-expression";
import ObserverVisitor                   from "./observer-visitor";
import ParallelWorker                    from "./parallel-worker";
import parse                             from "./parse";
import
{
    ON_PROCESS,
    PROCESSED,
    SCOPE}
from "./symbols";
import { Bindable } from "./types";

const scapeBrackets = (value: string) => value.replace(/(?<!\\)\\{/g, "{").replace(/\\\\{/g, "\\");

export default class TemplateProcessor
{
    private static readonly postProcessing: Map<Node, Array<Action>> = new Map();

    private readonly expressions =
    {
        interpolation: /(?<!(?<!\\)\\)(\{)(.*?)(\})/,
    };
    private readonly host:  Node|Element;
    private readonly scope: Indexer;

    private constructor(host: Node|Element, scope: Indexer)
    {
        this.host  = host;
        this.scope = { host, ...scope };
    }

    public static process(host: Node|Element, node: Node, scope?: Indexer): void
    {
        const processor = new TemplateProcessor(host, scope ?? { });

        if (TemplateProcessor.postProcessing.has(host))
        {
            ParallelWorker.run
            (
                () =>
                {
                    TemplateProcessor.postProcessing.get(host)!.forEach(action => action());

                    TemplateProcessor.postProcessing.delete(host);
                }
            );
        }

        processor.traverseElement(node);
    }

    public static clear(node: Bindable<Node>)
    {
        if (node[PROCESSED])
        {
            DataBind.unbind(node);

            node[SCOPE]     = undefined;
            node[PROCESSED] = false;
        }

        for (const element of node.childNodes as unknown as Iterable<Bindable<Element>>)
        {
            TemplateProcessor.clear(element);
        }
    }

    private bindAttributes(element: Element): void
    {
        const constructor = window.customElements.get(element.localName);

        const processor = constructor && element instanceof constructor ?
            TemplateProcessor.postProcessing.get(element) ?? TemplateProcessor.postProcessing.set(element, []).get(element)!
            : null;

        for (const bindedAttribute of this.wrapAttribute(element))
        {
            if (bindedAttribute.name.startsWith(":") || bindedAttribute.name.startsWith("on:") || this.expressions.interpolation.test(bindedAttribute.value))
            {
                const scope = createProxy({ this: element, ...this.scope });

                const rawExpression = bindedAttribute.value;

                bindedAttribute.value = "";

                const isEvent  = bindedAttribute.name.startsWith("on:");
                const isTwoWay = bindedAttribute.name.startsWith("::");
                const isOneWay = !isTwoWay && bindedAttribute.name.startsWith(":");

                const action = () =>
                {
                    if (isEvent)
                    {
                        const expression = parse(rawExpression);

                        const action = expression.type == NodeType.Identifier || expression.type == NodeType.MemberExpression ?
                            expression.evaluate(scope) as Action1<Event>
                            : () => expression.evaluate(scope);

                        element.addEventListener(bindedAttribute.name.replace(/^on:/, ""), action);
                        bindedAttribute.value = `[binding ${action.name || "expression"}]`;
                    }
                    else if (isOneWay || isTwoWay)
                    {
                        const attribute = document.createAttribute(bindedAttribute.name.replace(/^::?/, ""));

                        attribute.value = attribute.value;

                        element.removeAttributeNode(bindedAttribute);
                        element.setAttributeNode(attribute);

                        const propertyName    = dashedToCamel(attribute.name);
                        const elementMember   = Type.from(element).getMember(propertyName);
                        const canWriteElement = elementMember instanceof FieldInfo && !elementMember.readonly && !["class", "style"].includes(propertyName);

                        if (isTwoWay)
                        {
                            const target = scope;
                            const path   = rawExpression;

                            const notify = (value: unknown) => attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${value ?? ""}`;

                            const subscription = DataBind.oneWay(target, path, { notify })[1];

                            pushSubscription(element, subscription);

                            DataBind.twoWay(target, path, element as Indexer, propertyName);
                        }
                        else
                        {
                            const expression = parse(rawExpression);

                            if (canWriteElement)
                            {
                                throw new Error(`Property ${propertyName} of ${element.constructor.name} is readonly`);
                            }

                            const notify = (value: unknown) => (element as Indexer)[propertyName] = value;

                            let subscription = ObserverVisitor.observe(expression, scope, { notify }, false);

                            pushSubscription(element, subscription);
                        }
                    }
                    else
                    {
                        const expression = InterpolatedExpression.parse(rawExpression);

                        const notify = () => bindedAttribute.value = `${expression.evaluate(scope).reduce((previous, current) => `${previous}${current}`)}`;

                        let subscription = ObserverVisitor.observe(expression, scope, { notify }, false);

                        pushSubscription(element, subscription);
                    }
                };

                if (!processor)
                {
                    action();
                }
                else
                {
                    processor.push(() => ParallelWorker.run(action));
                }
            }
            else
            {
                bindedAttribute.value = scapeBrackets(bindedAttribute.value);
            }
        }
    }

    private bindTextNode(element: Element): void
    {
        if (!element.nodeValue)
        {
            return;
        }

        if (this.expressions.interpolation.test(element.nodeValue))
        {
            const scope = createProxy({ this: element.parentElement, ...this.scope });

            const rawExpression = element.nodeValue;

            element.nodeValue = "";

            const expression = InterpolatedExpression.parse(rawExpression);

            const notify = () => element.nodeValue = `${expression.evaluate(scope).reduce((previous, current) => `${previous}${current}`)}`;

            const subscription = ObserverVisitor.observe(expression, scope, { notify }, false);

            pushSubscription(element, subscription);
        }
        else
        {
            element.nodeValue = scapeBrackets(element.nodeValue);
        }
    }

    private traverseElement(node: Bindable<Node>): void
    {
        if (!node[PROCESSED])
        {
            node[ON_PROCESS]?.();

            for (const element of (Array.from(node.childNodes) as Iterable<Bindable<Element>>))
            {
                if (typeGuard<Element, HTMLTemplateElement>(element, x => x.tagName == "TEMPLATE"))
                {
                    if (element.parentNode)
                    {
                        DirectiveProcessor.process(this.host, element, createProxy(this.scope));
                    }
                }
                else
                {
                    element[SCOPE] = this.scope;

                    if (element.attributes?.length > 0)
                    {
                        this.bindAttributes(element);
                    }

                    if (element.nodeType == Node.TEXT_NODE)
                    {
                        this.bindTextNode(element);
                    }

                    this.traverseElement(element);
                }
            }

            node[PROCESSED] = true;
        }
    }

    private *wrapAttribute(element: Element): IterableIterator<Attr>
    {
        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.name.startsWith("*"))
            {
                const wrapper = document.createAttribute(attribute.name.replace(/^\*/, ""));

                wrapper.value = attribute.value;
                element.removeAttributeNode(attribute);
                element.setAttributeNode(wrapper);

                yield wrapper;
            }
            else
            {
                yield attribute;
            }
        }
    }
}