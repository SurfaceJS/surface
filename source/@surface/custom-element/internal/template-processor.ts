import { Action, Action1, Indexer }      from "@surface/core";
import { typeGuard }                     from "@surface/core/common/generic";
import { getKeyMember }                  from "@surface/core/common/object";
import { dashedToCamel }                 from "@surface/core/common/string";
import IArrayExpression                  from "@surface/expression/interfaces/array-expression";
import IExpression                       from "@surface/expression/interfaces/expression";
import NodeType                          from "@surface/expression/node-type";
import ISubscription                     from "@surface/reactive/interfaces/subscription";
import Type                              from "@surface/reflection";
import FieldInfo                         from "@surface/reflection/field-info";
import BindExpression                    from "./bind-expression";
import { createProxy, pushSubscription } from "./common";
import DataBind                          from "./data-bind";
import DirectiveProcessor                from "./directive-processor";
import ObserverVisitor                   from "./observer-visitor";
import ParallelWorker                    from "./parallel-worker";
import
{
    ON_PROCESS,
    PROCESSED,
    SCOPE}
from "./symbols";
import { Bindable } from "./types";

export default class TemplateProcessor
{
    private static readonly postProcessing: Map<Node, Array<Action>> = new Map();

    private readonly expressions =
    {
        databind: /\[\[.*\]\]|\{\{.*\}\}/,
        oneWay:   /^\[\[.*\]\]$/,
        path:     /^(?:\{\{|\[\[)\s*((?!\d)\w+(?:\.(?!\d)\w+)+)\s*(?:\]\]|\}\})$/,
        twoWay:   /^\{\{\s*(\w+\.?)+\s*\}\}$/
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

        for (const attribute of this.wrapAttribute(element))
        {
            if (this.expressions.databind.test(attribute.value))
            {
                const scope = createProxy({ this: element, ...this.scope });

                const rawExpression = attribute.value;

                attribute.value = "";

                const action = () =>
                {
                    if (attribute.name.startsWith("on-"))
                    {
                        const expression = BindExpression.parse(rawExpression);

                        const action = expression.type == NodeType.Identifier || expression.type == NodeType.MemberExpression ?
                            expression.evaluate(scope) as Action1<Event>
                            : () => expression.evaluate(scope);

                        element.addEventListener(attribute.name.replace(/^on-/, ""), action);
                        attribute.value = `[binding ${action.name || "expression"}]`;
                    }
                    else
                    {
                        const isOneWay         = this.expressions.oneWay.test(rawExpression);
                        const isTwoWay         = this.expressions.twoWay.test(rawExpression);
                        const isPathExpression = this.expressions.path.test(rawExpression);
                        const interpolation    = !(isOneWay || isTwoWay);
                        const attributeName    = dashedToCamel(attribute.name);
                        const elementMember    = Type.from(element).getMember(attributeName);
                        const canWriteElement  = elementMember instanceof FieldInfo && !elementMember.readonly && !["class", "style"].includes(attributeName);

                        if (isPathExpression)
                        {
                            const match = this.expressions.path.exec(rawExpression);

                            const target = scope;
                            const path   = match![1];

                            const [key, member] = getKeyMember(target, path);

                            const targetMember = Type.from(member).getMember(key);

                            const canWriteTarget = targetMember instanceof FieldInfo && !targetMember.readonly;

                            const notify = isTwoWay && !canWriteElement ?
                                (value: unknown) => attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${value ?? ""}`
                                : (value: unknown) =>
                                {
                                    (element as Indexer)[attributeName] = value;

                                    attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${value ?? ""}`;
                                };

                            const subscription = DataBind.oneWay(target, path, { notify })[1];

                            pushSubscription(element, subscription);

                            if (isTwoWay && canWriteTarget && canWriteElement)
                            {
                                DataBind.twoWay(target, path, element as Indexer, attributeName);
                            }
                        }
                        else
                        {
                            const expression = BindExpression.parse(rawExpression);

                            const notify = () =>
                            {
                                const value = typeGuard<IExpression, IArrayExpression>(expression, x => x.type == NodeType.ArrayExpression) && interpolation ?
                                    expression.evaluate(scope).reduce((previous, current) => `${previous}${current}`, "") :
                                    expression.evaluate(scope);

                                if (canWriteElement)
                                {
                                    (element as Indexer)[attributeName] = value;
                                }

                                attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${value ?? ""}`;
                            };

                            let subscription = ObserverVisitor.observe(expression, scope, { notify }, true);

                            pushSubscription(element, subscription);

                            notify();
                        }
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
        }
    }

    private bindTextNode(element: Element): void
    {
        if (element.nodeValue && this.expressions.databind.test(element.nodeValue))
        {
            const scope = createProxy({ this: element.parentElement, ...this.scope });

            const rawExpression = element.nodeValue;

            element.nodeValue = "";

            const match = this.expressions.path.exec(rawExpression);

            let subscription: ISubscription;

            if (match)
            {
                subscription = DataBind.oneWay(scope, match[1], { notify: value => element.nodeValue = `${value ?? ""}` })[1];
            }
            else
            {
                const expression = BindExpression.parse(rawExpression);

                const notify = typeGuard<IExpression, IArrayExpression>(expression, x => x.type == NodeType.ArrayExpression) ?
                    () => element.nodeValue = `${expression.evaluate(scope).reduce((previous, current) => `${previous}${current}`)}` :
                    () => element.nodeValue = `${expression.evaluate(scope) ?? ""}`;

                subscription = ObserverVisitor.observe(expression, scope, { notify }, true);

                notify();
            }

            pushSubscription(element, subscription);
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