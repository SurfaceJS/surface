import { Action, Action1, Indexer } from "@surface/core";
import { assert, typeGuard }        from "@surface/core/common/generic";
import { getKeyMember }             from "@surface/core/common/object";
import { dashedToCamel }            from "@surface/core/common/string";
import NodeType                     from "@surface/expression/node-type";
import Type                         from "@surface/reflection";
import FieldInfo                    from "@surface/reflection/field-info";
import
{
    classMap,
    createScope,
    enumerateExpresssionAttributes,
    pushSubscription,
    scapeBrackets,
    styleMap
}
from "./common";
import DataBind               from "./data-bind";
import DirectiveProcessor     from "./directive-processor";
import InterpolatedExpression from "./interpolated-expression";
import ObserverVisitor        from "./observer-visitor";
import parse                  from "./parse";
import { interpolation }      from "./patterns";
import
{
    ON_PROCESS,
    PROCESSED,
    SCOPE
}
from "./symbols";
import { Bindable } from "./types";

export default class TemplateProcessor
{
    private static readonly postProcessing: Map<Node, Array<Action>> = new Map();

    private readonly directives: Array<Promise<void>> = [];

    private readonly host:  Node|Element;
    private readonly scope: Indexer;

    private constructor(host: Node|Element, scope: Indexer)
    {
        this.host  = host;
        this.scope = { host, ...scope };
    }

    public static process(host: Node|Element, node: Node, scope?: Indexer): Promise<void>
    {
        const processor = new TemplateProcessor(host, scope ?? { });

        if (TemplateProcessor.postProcessing.has(host))
        {
            TemplateProcessor.postProcessing.get(host)!.forEach(action => action());

            TemplateProcessor.postProcessing.delete(host);
        }

        processor.traverseElement(node);

        return Promise.all(processor.directives) as unknown as Promise<void>;
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

    private processAttributes(element: Element): void
    {
        const constructor = window.customElements.get(element.localName);

        const processor = constructor && !(element instanceof constructor) ?
            TemplateProcessor.postProcessing.get(element) ?? TemplateProcessor.postProcessing.set(element, []).get(element)!
            : null;

        for (const attribute of enumerateExpresssionAttributes(element))
        {
            const scope = createScope({ this: element, ...this.scope });

            const rawExpression = attribute.value;
            const attributeName = attribute.name.replace(/^(on)?::?/, "");
            const isEvent       = attribute.name.startsWith("on:");
            const isTwoWay      = attribute.name.startsWith("::");
            const isOneWay      = !isTwoWay && attribute.name.startsWith(":");

            attribute.value = "";

            if (isEvent || isOneWay || isTwoWay)
            {
                element.removeAttributeNode(attribute);
            }

            const action = () =>
            {
                if (isEvent)
                {
                    const expression = parse(rawExpression);

                    const action = expression.type == NodeType.ArrowFunctionExpression || expression.type == NodeType.Identifier || expression.type == NodeType.MemberExpression
                        ? expression.evaluate(scope) as Action1<Event>
                        : () => expression.evaluate(scope);

                    element.addEventListener(attributeName, action);
                }
                else if (isOneWay || isTwoWay)
                {
                    const elementProperty = dashedToCamel(attributeName);
                    const elementMember   = Type.from(element).getMember(elementProperty);

                    if (elementMember instanceof FieldInfo && elementMember.readonly)
                    {
                        throw new Error(`Property ${elementProperty} of ${element.constructor.name} is readonly`);
                    }

                    if (isOneWay)
                    {
                        const expression = parse(rawExpression);

                        let notify: Action;

                        if (attributeName == "class" || attributeName == "style")
                        {
                            const attribute = document.createAttribute(attributeName);

                            element.setAttributeNode(attribute);

                            notify = attributeName == "class"
                                ? () => attribute.value = classMap(expression.evaluate(scope) as Record<string, boolean>)
                                : () => attribute.value = styleMap(expression.evaluate(scope) as Record<string, boolean>);
                        }
                        else
                        {
                            notify = () => (element as Indexer)[elementProperty] = expression.evaluate(scope);
                        }


                        let subscription = ObserverVisitor.observe(expression, scope, { notify }, true);

                        notify();

                        pushSubscription(element, subscription);
                    }
                    else
                    {
                        const [targetProperty, target] = getKeyMember(scope, rawExpression);

                        const targetMember = Type.from(target).getMember(targetProperty);

                        if (targetMember instanceof FieldInfo && targetMember.readonly)
                        {
                            throw new Error(`Property ${targetProperty} of ${target.constructor.name} is readonly`);
                        }

                        DataBind.twoWay(target, targetProperty, element as Indexer, elementProperty);
                    }
                }
                else
                {
                    const expression = InterpolatedExpression.parse(rawExpression);

                    const notify = () => attribute.value = `${expression.evaluate(scope).reduce((previous, current) => `${previous}${current}`)}`;

                    let subscription = ObserverVisitor.observe(expression, scope, { notify }, true);

                    pushSubscription(element, subscription);

                    notify();
                }
            };

            if (!processor)
            {
                action();
            }
            else
            {
                processor.push(action);
            }
        }
    }

    private processTextNode(element: Element): void
    {
        assert(element.nodeValue);

        if (interpolation.test(element.nodeValue))
        {
            const scope = createScope({ this: element.parentElement, ...this.scope });

            const rawExpression = element.nodeValue;

            element.nodeValue = "";

            const expression = InterpolatedExpression.parse(rawExpression);

            const notify = () => element.nodeValue = `${expression.evaluate(scope).reduce((previous, current) => `${previous}${current}`)}`;

            const subscription = ObserverVisitor.observe(expression, scope, { notify }, true);

            pushSubscription(element, subscription);

            notify();
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

            for (const childNode of (Array.from(node.childNodes) as Iterable<Bindable<Element>>))
            {
                if (typeGuard<HTMLTemplateElement>(childNode, childNode.nodeName == "TEMPLATE"))
                {
                    if (childNode.parentNode)
                    {
                        this.directives.push(DirectiveProcessor.process(this.host, childNode, createScope(this.scope)));
                    }
                }
                else if ((childNode.nodeType == Node.ELEMENT_NODE || Node.TEXT_NODE) && childNode.nodeName != "STYLE")
                {
                    childNode[SCOPE] = this.scope;

                    if (childNode.attributes?.length > 0)
                    {
                        this.processAttributes(childNode);
                    }

                    if (childNode.nodeType == Node.TEXT_NODE)
                    {
                        this.processTextNode(childNode);
                    }

                    this.traverseElement(childNode);
                }
            }

            node[PROCESSED] = true;
        }
    }
}