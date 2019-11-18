import { Action, Indexer }  from "@surface/core";
import { typeGuard }        from "@surface/core/common/generic";
import { getKeyMember }     from "@surface/core/common/object";
import { dashedToCamel }    from "@surface/core/common/string";
import IArrayExpression     from "@surface/expression/interfaces/array-expression";
import IExpression          from "@surface/expression/interfaces/expression";
import NodeType             from "@surface/expression/node-type";
import ISubscription        from "@surface/reactive/interfaces/subscription";
import Type                 from "@surface/reflection";
import FieldInfo            from "@surface/reflection/field-info";
import PropertyInfo         from "@surface/reflection/property-info";
import BindExpression       from "./bind-expression";
import { pushSubscription } from "./common";
import createProxy          from "./create-proxy";
import DataBind             from "./data-bind";
import DirectiveProcessor   from "./directive-processor";
import ObserverVisitor      from "./observer-visitor";
import
{
    ON_PROCESS,
    PROCESSED,
    SCOPE}
from "./symbols";
import { Bindable } from "./types";

export default class TemplateProcessor
{
    private static readonly lazyAttributesBind: Map<Node, Array<Action>> = new Map();

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

        if (TemplateProcessor.lazyAttributesBind.has(host))
        {
            TemplateProcessor.lazyAttributesBind.get(host)!.forEach(action => action());

            TemplateProcessor.lazyAttributesBind.delete(host);
        }

        processor.traverseElement(node);
    }

    public static clear(node: Bindable<Node>)
    {
        if (node[PROCESSED])
        {
            DataBind.unbind(node);

            node[SCOPE]   = undefined;
            node[PROCESSED] = false;
        }

        for (const element of node.childNodes as unknown as Iterable<Bindable<Element>>)
        {
            TemplateProcessor.clear(element);
        }
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private bindAttributes(element: Element): void
    {
        for (const attribute of this.wrapAttribute(element))
        {
            if (this.expressions.databind.test(attribute.value))
            {
                const scope = createProxy({ this: element, ...this.scope });

                const action = () =>
                {
                    if (attribute.name.startsWith("on-"))
                    {
                        const expression = BindExpression.parse(attribute.value);

                        const action = expression.type == NodeType.Identifier || expression.type == NodeType.MemberExpression ?
                            expression.evaluate(scope) as Action
                            : () => expression.evaluate(scope);

                        element.addEventListener(attribute.name.replace(/^on-/, ""), action);
                        attribute.value = `[binding ${action.name || "expression"}]`;
                    }
                    else
                    {
                        const isOneWay         = this.expressions.oneWay.test(attribute.value);
                        const isTwoWay         = this.expressions.twoWay.test(attribute.value);
                        const isPathExpression = this.expressions.path.test(attribute.value);
                        const interpolation    = !(isOneWay || isTwoWay);
                        const attributeName    = dashedToCamel(attribute.name);
                        const elementMember    = Type.from(element).getMember(attributeName);
                        const canWrite         = !!(elementMember && !(elementMember instanceof PropertyInfo && elementMember.readonly || elementMember instanceof FieldInfo && elementMember.readonly) && !["class", "style"].includes(attributeName));

                        if (isPathExpression)
                        {
                            const match = this.expressions.path.exec(attribute.value);

                            const target = scope;
                            const path   = match![1];

                            const [key, member] = getKeyMember(target, path);

                            const targetMember = Type.from(member).getMember(key);

                            const notify = (value: unknown) =>
                            {
                                if (canWrite)
                                {
                                    (element as Indexer)[attributeName] = value;
                                }

                                attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${value ?? ""}`;
                            };

                            const subscription = DataBind.oneWay(target, path, { notify })[1];

                            pushSubscription(element, subscription);

                            const canBindLeft  = elementMember instanceof FieldInfo && !elementMember.readonly;
                            const canBindRigth = targetMember instanceof FieldInfo && !targetMember.readonly;

                            if (isTwoWay && canBindLeft && canBindRigth)
                            {
                                DataBind.twoWay(target, path, element as Indexer, attributeName);
                            }
                        }
                        else
                        {
                            const expression = BindExpression.parse(attribute.value);

                            const notify = () =>
                            {
                                const value = typeGuard<IExpression, IArrayExpression>(expression, x => x.type == NodeType.ArrayExpression) && interpolation ?
                                    expression.evaluate(scope).reduce((previous, current) => `${previous}${current}`) :
                                    expression.evaluate(scope);

                                if (canWrite)
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

                const constructor = window.customElements.get(element.localName);

                if (!constructor || constructor && element instanceof constructor)
                {
                    action();
                }
                else
                {
                    const actions = TemplateProcessor.lazyAttributesBind.get(element) ?? [];

                    actions.push(action);

                    TemplateProcessor.lazyAttributesBind.set(element, actions);
                }
            }
        }
    }

    private bindTextNode(element: Element): void
    {
        if (element.nodeValue && this.expressions.databind.test(element.nodeValue))
        {
            const scope = createProxy({ this: element.parentElement, ...this.scope });

            const match = this.expressions.path.exec(element.nodeValue);

            let subscription: ISubscription;

            if (match)
            {
                subscription = DataBind.oneWay(scope, match[1], { notify: value => element.nodeValue = `${value ?? ""}` })[1];
            }
            else
            {
                const expression = BindExpression.parse(element.nodeValue);

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
                    DirectiveProcessor.process(this.host, element, createProxy(this.scope));
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