import { Action2, Indexer, Nullable } from "@surface/core";
import { contains }                   from "@surface/core/common/array";
import { typeGuard }                  from "@surface/core/common/generic";
import Expression                     from "@surface/expression";
import Evaluate                       from "@surface/expression/evaluate";
import IArrowFunctionExpression       from "@surface/expression/interfaces/arrow-function-expression";
import IExpression                    from "@surface/expression/interfaces/expression";
import ISubscription                  from "@surface/reactive/interfaces/subscription";
import createProxy                    from "./create-proxy";
import ObserverVisitor                from "./observer-visitor";
import ParallelWorker                 from "./parallel-worker";
import parse                          from "./parse";
import
{
    INJECTED_TEMPLATES,
    ON_PROCESS,
    ON_REMOVED,
    PROCESSED,
    SCOPE,
    SUBSCRIPTIONS
} from "./symbols";
import TemplateProcessor from "./template-processor";
import { Bindable }      from "./types";

const __DECOPOSED__ = "__DECOPOSED__";
const __INJECTOR__  = "__INJECTOR__";
const HASH_ELSE     = "#else";
const HASH_ELSE_IF  = "#else-if";
const HASH_FOR      = "#for";
const HASH_IF       = "#if";
const HASH_INJECT   = "#inject";
const HASH_INJECTOR = "#injector";

export default class DirectiveProcessor
{
    private static decomposeDirectives(template: HTMLTemplateElement): void
    {
        if (!template.hasAttribute(__DECOPOSED__))
        {
            const attributes = template.getAttributeNames();

            const organize = (template: HTMLTemplateElement, innerTemplate: HTMLTemplateElement) =>
            {
                Array.from(template.content.childNodes).forEach(x => x.remove());

                DirectiveProcessor.decomposeDirectives(innerTemplate);

                template.content.appendChild(innerTemplate);
            };

            if (attributes.length > 0)
            {
                const injectKey   = attributes.filter(x => x.startsWith(HASH_INJECT + ":"))[0]   as string|null;
                const injectorKey = attributes.filter(x => x.startsWith(HASH_INJECTOR + ":"))[0] as string|null;

                if (injectKey && (contains(attributes, [HASH_IF, HASH_ELSE_IF, HASH_ELSE]) || attributes.includes(HASH_FOR) || injectorKey))
                {
                    const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                    template.removeAttribute(HASH_IF);
                    template.removeAttribute(HASH_ELSE_IF);
                    template.removeAttribute(HASH_ELSE);
                    template.removeAttribute(HASH_FOR);

                    if (injectorKey)
                    {
                        template.removeAttribute(injectorKey);
                    }

                    innerTemplate.removeAttribute(injectKey);

                    organize(template, innerTemplate);
                }
                else if (contains(attributes, [HASH_IF, HASH_ELSE_IF, HASH_ELSE]))
                {
                    if (template.nextElementSibling?.tagName == "TEMPLATE" && contains(template.nextElementSibling.getAttributeNames(), [HASH_ELSE_IF, HASH_ELSE]))
                    {
                        DirectiveProcessor.decomposeDirectives(template.nextElementSibling as HTMLTemplateElement);
                    }

                    if (attributes.includes(HASH_FOR) || injectorKey)
                    {
                        const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                        template.removeAttribute(HASH_FOR);

                        if (injectorKey)
                        {
                            template.removeAttribute(injectorKey);
                        }

                        innerTemplate.removeAttribute(HASH_IF);
                        innerTemplate.removeAttribute(HASH_ELSE_IF);
                        innerTemplate.removeAttribute(HASH_ELSE);

                        organize(template, innerTemplate);
                    }
                }
                else if (attributes.includes(HASH_FOR) && injectorKey)
                {
                    const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                    template.removeAttribute(injectorKey);

                    innerTemplate.removeAttribute(HASH_FOR);

                    organize(template, innerTemplate);
                }
                else if (injectorKey)
                {
                    template.setAttribute(__INJECTOR__, injectorKey.split(":")[1]);
                }
            }
        }

        template.setAttribute(__DECOPOSED__, "");
    }

    private static async processConditionalDirectives(host: Bindable<Element|Node>, template: HTMLTemplateElement, parent: Node, scope: Indexer): Promise<void>
    {
        const start = document.createComment("if-directive-start");
        const end   = document.createComment("if-directive-end");

        const expressions:   Array<[IExpression, HTMLTemplateElement]> = [];
        const subscriptions: Array<ISubscription>                      = [];

        (start as Bindable<Node>)[ON_REMOVED] = () => subscriptions.forEach(x => x.unsubscribe());

        const task = () =>
        {
            if (!end.parentNode)
            {
                subscriptions.forEach(x => x.unsubscribe());

                return;
            }

            let simbling: Nullable<ChildNode> = null;

            while ((simbling = start.nextSibling) && simbling != end)
            {
                simbling.remove();

                (simbling as Bindable<Node>)[ON_REMOVED]?.();

                TemplateProcessor.clear(simbling);
            }

            for (const [expression, template] of expressions)
            {
                if (expression.evaluate(scope))
                {
                    const content = template.content.cloneNode(true) as Element;

                    content.normalize();

                    TemplateProcessor.process(host, content, scope);

                    end.parentNode.insertBefore(content, end);

                    break;
                }
            }
        };

        const notify = () => ParallelWorker.run(task);

        const listener = { notify };

        const expression = parse(template.getAttribute(HASH_IF)!);

        subscriptions.push(ObserverVisitor.observe(expression, scope, listener, true));

        expressions.push([expression, template]);

        let simbling = template.nextElementSibling;

        while (simbling && typeGuard<Element, HTMLTemplateElement>(simbling, x => x.tagName == "TEMPLATE"))
        {
            if (simbling.hasAttribute(HASH_ELSE_IF))
            {
                const expression = parse(simbling.getAttribute(HASH_ELSE_IF)!);

                subscriptions.push(ObserverVisitor.observe(expression, scope, listener, true));

                expressions.push([expression, simbling]);

                const next = simbling.nextElementSibling;

                simbling.remove();

                simbling = next;
            }
            else if (simbling.hasAttribute(HASH_ELSE))
            {
                simbling.remove();

                expressions.push([Expression.literal(true), simbling]);

                break;
            }
            else
            {
                break;
            }
        }

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        await notify();
    }

    private static async processForDirectives(host: Bindable<Element|Node>, template: HTMLTemplateElement, parent: Node, scope: Indexer): Promise<void>
    {
        const start = document.createComment("for-directive-start");
        const end   = document.createComment("for-directive-end");

        const forExpression = /(?:const|var|let)\s+(.*)\s+(in|of)\s+(.*)/;
        const rawExpression = template.getAttribute(HASH_FOR)!;

        if (!forExpression.test(rawExpression))
        {
            throw new Error(`Invalid ${HASH_FOR} directive expression: ${rawExpression}`);
        }

        const [, aliasExpression, operator, iterableExpression] = forExpression.exec(rawExpression)!.map(x => x.trim());

        const destructured = aliasExpression.startsWith("[") || aliasExpression.startsWith("{");

        const expression = parse(iterableExpression);

        let cache: Array<[unknown, ChildNode, ChildNode]> = [];

        const forInIterator = (elements: Array<unknown>, action: Action2<unknown, number>) =>
        {
            let index = 0;
            for (const element in elements)
            {
                action(element, index);
                index++;
            }
        };

        const forOfIterator = (elements: Array<unknown>, action: Action2<unknown, number>) =>
        {
            let index = 0;
            for (const element of elements)
            {
                action(element, index);
                index++;
            }
        };

        const notifyFactory = (iterator: Action2<Array<unknown>, Action2<unknown, number>>) =>
        {
            let changedTree = false;
            const tree = document.createDocumentFragment();

            const action = (element: unknown, index: number) =>
            {
                if (index >= cache.length || (index < cache.length && !Object.is(element, cache[index][0])))
                {
                    const rowStart = document.createComment(`for-directive-element[${index}]-start`);
                    const rowEnd   = document.createComment(`for-directive-element[${index}]-end`);

                    const content = template.content.cloneNode(true) as Element;

                    content.normalize();

                    const mergedScope = destructured ?
                        { ...Evaluate.pattern(scope, (parse(`(${aliasExpression}) => 0`) as IArrowFunctionExpression).parameters[0], element), ...scope, [SUBSCRIPTIONS]: [] }
                        : { ...scope, [aliasExpression]: element, [SUBSCRIPTIONS]: [] };

                    tree.appendChild(rowStart);

                    TemplateProcessor.process(host, content, mergedScope);

                    if (index < cache.length)
                    {
                        const [, $rowStart, $rowEnd] = cache[index];

                        let simbling: Nullable<ChildNode> = null;

                        while ((simbling = $rowStart.nextSibling) && simbling != $rowEnd)
                        {
                            simbling.remove();

                            (simbling as Bindable<Node>)[ON_REMOVED]?.();

                            TemplateProcessor.clear(simbling);
                        }

                        $rowStart.remove();
                        $rowEnd.remove();

                        cache[index] = [element, rowStart, rowEnd];

                        changedTree = true;
                    }
                    else
                    {
                        cache.push([element, rowStart, rowEnd]);
                    }

                    tree.appendChild(content);

                    tree.appendChild(rowEnd);
                }
                else if (changedTree)
                {
                    const [, rowStart, rowEnd] = cache[index];

                    let simbling: Nullable<ChildNode> = null;

                    const clone = rowStart.cloneNode();

                    tree.appendChild(clone);

                    while ((simbling = rowStart.nextSibling) && simbling != rowEnd)
                    {
                        tree.appendChild(simbling);
                    }

                    rowStart.remove();

                    tree.replaceChild(rowStart, clone);
                    tree.appendChild(rowEnd);
                }
            };

            return () =>
            {
                if (!end.parentNode)
                {
                    subscription.unsubscribe();

                    return;
                }

                const elements = expression.evaluate(scope) as Array<Element>;

                if (elements.length < cache.length)
                {
                    for (const [, rowStart, rowEnd] of cache.splice(elements.length))
                    {
                        let simbling: Nullable<ChildNode> = null;

                        while ((simbling = rowStart.nextSibling) && simbling != rowEnd)
                        {
                            simbling.remove();

                            (simbling as Bindable<Node>)[ON_REMOVED]?.();

                            TemplateProcessor.clear(simbling);
                        }

                        rowStart.remove();
                        rowEnd.remove();
                    }
                }

                if (elements.length > 0)
                {
                    iterator(elements, action);
                }

                end.parentNode.insertBefore(tree, end);
            };
        };

        const task = notifyFactory(operator == "in" ? forInIterator : forOfIterator);

        const notify = () => ParallelWorker.run(task);

        const subscription = ObserverVisitor.observe(expression, scope, { notify }, true);

        (start as Bindable<Node>)[ON_REMOVED] = () => subscription.unsubscribe();

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        await notify();
    }

    private static async processInjectorDirectives(host: Bindable<Element>, template: HTMLTemplateElement, parent: Node, scope: Indexer): Promise<void>
    {
        const start = document.createComment("injector-directive-start");
        const end   = document.createComment("injector-directive-end");

        const injectorKey   = template.getAttribute(__INJECTOR__)!;
        const injectorScope = template.getAttribute(`${HASH_INJECTOR}:${injectorKey}`);

        const injectedTemplates = host[INJECTED_TEMPLATES] = host[INJECTED_TEMPLATES] ?? new Map<string, Nullable<HTMLTemplateElement>>();

        if (!injectedTemplates.has(injectorKey))
        {
            const injectionTemplate = host.querySelector<HTMLTemplateElement>(`template[\\${HASH_INJECT}\\:${injectorKey}]`);

            if (injectionTemplate)
            {
                injectedTemplates.set(injectorKey, injectionTemplate);

                injectionTemplate.remove();
            }
        }

        const injectionTemplate = injectedTemplates.get(injectorKey) ?? template;

        DirectiveProcessor.decomposeDirectives(injectionTemplate);

        const scopeExpression = injectionTemplate.getAttribute(`${HASH_INJECT}:${injectorKey}`) || "__scope__";

        const expression = parse(`(${injectorScope || "{ }"})`);

        const proxyScope = createProxy(scope);

        const isDestructured = scopeExpression.startsWith("{");

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        let subscription: ISubscription;

        const pattern = (parse(`(${scopeExpression}) => 0`) as IArrowFunctionExpression).parameters[0];

        const task = () =>
        {
            if (!end.parentNode)
            {
                subscription.unsubscribe();

                return;
            }

            let simbling: Nullable<ChildNode> = null;

            while ((simbling = start.nextSibling) && simbling != end)
            {
                simbling.remove();

                (simbling as Bindable<Node>)[ON_REMOVED]?.();

                TemplateProcessor.clear(simbling);
            }

            const { elementScope, scopeAlias } = isDestructured ?
                { elementScope: Evaluate.pattern(scope, pattern, expression.evaluate(proxyScope)), scopeAlias: "" }
                : { elementScope: expression.evaluate(proxyScope) as Indexer, scopeAlias: scopeExpression };

            const mergedScope = isDestructured ?
                { ...elementScope, ...host[SCOPE], [SUBSCRIPTIONS]: [] }
                : { [scopeAlias]: elementScope, ...host[SCOPE], [SUBSCRIPTIONS]: [] };

            const content = document.importNode(injectionTemplate.content, true);

            content.normalize();

            TemplateProcessor.process(host, content, mergedScope);

            end.parentNode.insertBefore(content, end);
        };

        const notify = () => ParallelWorker.run(task);

        subscription = ObserverVisitor.observe(expression, proxyScope, { notify }, true);

        (start as Bindable<Node>)[ON_REMOVED] = () => subscription.unsubscribe();

        if (!host[PROCESSED])
        {
            const onAfterBinded = host[ON_PROCESS];

            host[ON_PROCESS] = function()
            {
                if (onAfterBinded)
                {
                    onAfterBinded.call(this);
                }

                notify();

                host[ON_PROCESS] = onAfterBinded;
            };
        }
        else
        {
            await notify();
        }
    }

    public static async process(host: Element|Node, template: HTMLTemplateElement, scope: Indexer): Promise<void>
    {
        if (!template.parentNode)
        {
            throw new Error("Cannot process orphan templates");
        }

        const parent = template.parentNode;

        DirectiveProcessor.decomposeDirectives(template);

        if (template.hasAttribute(HASH_IF))
        {
            await DirectiveProcessor.processConditionalDirectives(host, template, parent, scope);
        }
        else if (template.hasAttribute(HASH_FOR))
        {
            await DirectiveProcessor.processForDirectives(host, template, parent, scope);
        }
        else if (!!template.hasAttribute(__INJECTOR__) && "querySelector" in host)
        {
            await DirectiveProcessor.processInjectorDirectives(host, template, parent, scope);
        }
    }
}