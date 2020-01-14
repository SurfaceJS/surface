import { Action2, Func2, Indexer, Nullable } from "@surface/core";
import { contains }                          from "@surface/core/common/array";
import { assert, typeGuard }                 from "@surface/core/common/generic";
import Expression                            from "@surface/expression";
import Evaluate                              from "@surface/expression/evaluate";
import IArrowFunctionExpression              from "@surface/expression/interfaces/arrow-function-expression";
import IExpression                           from "@surface/expression/interfaces/expression";
import ISubscription                         from "@surface/reactive/interfaces/subscription";
import { enumerateRange }                    from "./common";
import ObserverVisitor                       from "./observer-visitor";
import ParallelWorker                        from "./parallel-worker";
import parse                                 from "./parse";
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

                template.setAttribute(__DECOPOSED__, "");
            };

            if (attributes.length > 0)
            {
                const injectKey   = attributes.find(x => x.startsWith(HASH_INJECT + ":"));
                const injectorKey = attributes.find(x => x.startsWith(HASH_INJECTOR + ":"));

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
    }

    private static removeBindingsInRange(start: ChildNode, end: ChildNode): void
    {
        for (const element of enumerateRange(start, end))
        {
            element.remove();

            (element as Bindable<Node>)[ON_REMOVED]?.();

            TemplateProcessor.clear(element);
        }
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

            DirectiveProcessor.removeBindingsInRange(start, end);

            for (const [expression, template] of expressions)
            {
                if (expression.evaluate(scope))
                {
                    const [content, promise] = DirectiveProcessor.processTemplate(template, host, scope);

                    end.parentNode.insertBefore(content, end);

                    return promise;
                }
            }

            return Promise.resolve();
        };

        const notify = async () => await ParallelWorker.run(task);

        const listener = { notify };

        const expression = parse(template.getAttribute(HASH_IF)!);

        subscriptions.push(ObserverVisitor.observe(expression, scope, listener, true));

        expressions.push([expression, template]);

        let simbling = template.nextElementSibling;

        while (simbling && typeGuard<HTMLTemplateElement>(simbling, simbling.tagName == "TEMPLATE"))
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

        const forInIterator = (elements: Array<unknown>, action: Func2<unknown, number, Promise<void>>) =>
        {
            const promises = [];

            let index = 0;
            for (const element in elements)
            {
                promises.push(action(element, index));
                index++;
            }

            return promises;
        };

        const forOfIterator = (elements: Array<unknown>, action: Func2<unknown, number, Promise<void>>) =>
        {
            const promises = [];

            let index = 0;
            for (const element of elements)
            {
                promises.push(action(element, index));
                index++;
            }

            return promises;
        };

        const notifyFactory = (iterator: Action2<Array<unknown>, Func2<unknown, number, Promise<void>>>) =>
        {
            let changedTree = false;
            const tree = document.createDocumentFragment();

            const action = (element: unknown, index: number) =>
            {
                if (index >= cache.length || (index < cache.length && !Object.is(element, cache[index][0])))
                {
                    const mergedScope = destructured
                        ? { ...Evaluate.pattern(scope, (parse(`(${aliasExpression}) => 0`) as IArrowFunctionExpression).parameters[0], element), ...scope, [SUBSCRIPTIONS]: [] }
                        : { ...scope, [aliasExpression]: element, [SUBSCRIPTIONS]: [] };

                    const rowStart = document.createComment(`for-directive-element[${index}]-start`);
                    const rowEnd   = document.createComment(`for-directive-element[${index}]-end`);

                    tree.appendChild(rowStart);

                    const [content, promise] = DirectiveProcessor.processTemplate(template, host, mergedScope);

                    if (index < cache.length)
                    {
                        const [, $rowStart, $rowEnd] = cache[index];

                        DirectiveProcessor.removeBindingsInRange($rowStart, $rowEnd);

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

                    return promise;
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

                return Promise.resolve();
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
                        DirectiveProcessor.removeBindingsInRange(rowStart, rowEnd);

                        rowStart.remove();
                        rowEnd.remove();
                    }
                }

                const promises = iterator(elements, action);

                end.parentNode.insertBefore(tree, end);

                return promises;
            };
        };

        const task = notifyFactory(operator == "in" ? forInIterator : forOfIterator);

        const notify = async () => await ParallelWorker.run(task);

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

            DirectiveProcessor.removeBindingsInRange(start, end);

            const { elementScope, scopeAlias } = isDestructured
                ? { elementScope: Evaluate.pattern(scope, pattern, expression.evaluate(scope)), scopeAlias: "" }
                : { elementScope: expression.evaluate(scope) as Indexer, scopeAlias: scopeExpression };

            const mergedScope = isDestructured
                ? { ...elementScope, ...host[SCOPE], [SUBSCRIPTIONS]: [] }
                : { [scopeAlias]: elementScope, ...host[SCOPE], [SUBSCRIPTIONS]: [] };

            const [content, promise] = DirectiveProcessor.processTemplate(injectionTemplate, host, mergedScope);

            end.parentNode.insertBefore(content, end);

            return promise;
        };

        const notify = async () => await ParallelWorker.run(task);

        subscription = ObserverVisitor.observe(expression, scope, { notify }, true);

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

    private static processTemplate(template: HTMLTemplateElement, host: Node, scope: Indexer): [Element, Promise<void>]
    {
        const content = template.content.cloneNode(true) as Element;

        content.normalize();

        const promise = TemplateProcessor.process(host, content, scope);

        return [content, promise];
    }

    public static async process(host: Element|Node, template: HTMLTemplateElement, scope: Indexer): Promise<void>
    {
        assert(template.parentNode, "Cannot process orphan templates");

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