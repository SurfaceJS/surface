import { Action1, Action2, Indexer, Nullable }                        from "@surface/core";
import { contains }                                                   from "@surface/core/common/array";
import { typeGuard }                                                  from "@surface/core/common/generic";
import Expression                                                     from "@surface/expression";
import Evaluate                                                       from "@surface/expression/evaluate";
import IArrowFunctionExpression                                       from "@surface/expression/interfaces/arrow-function-expression";
import IExpression                                                    from "@surface/expression/interfaces/expression";
import ISubscription                                                  from "@surface/reactive/interfaces/subscription";
import createProxy                                                    from "./create-proxy";
import ObserverVisitor                                                from "./observer-visitor";
import parse                                                          from "./parse";
import { INJECTED_TEMPLATES, INJECTOR, ON_PROCESS, PROCESSED, SCOPE } from "./symbols";
import TemplateProcessor                                              from "./template-processor";

type Bindable<T extends object> = T &
{
    [SCOPE]?:              Indexer;
    [ON_PROCESS]?:         Action1<Indexer>;
    [PROCESSED]?:          boolean;
    [INJECTED_TEMPLATES]?: Map<string, Nullable<HTMLTemplateElement>>;
};

type HTMLTemplateElementDirective = HTMLTemplateElement &
{
    [INJECTOR]?: string;
};

export default class DirectiveProcessor
{
    private static decomposeDirectives(template: HTMLTemplateElementDirective): void
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
            const injectKey   = attributes.filter(x => x.startsWith("#inject:"))[0]   as string|null;
            const injectorKey = attributes.filter(x => x.startsWith("#injector:"))[0] as string|null;

            if (injectKey && (contains(attributes, ["#if", "#else-if", "#else"]) || attributes.includes("#for") || injectorKey))
            {
                const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                template.removeAttribute("#if");
                template.removeAttribute("#else-if");
                template.removeAttribute("#else");
                template.removeAttribute("#for");

                if (injectorKey)
                {
                    template.removeAttribute(injectorKey);
                }

                innerTemplate.removeAttribute(injectKey);

                organize(template, innerTemplate);
            }
            else if (contains(attributes, ["#if", "#else-if", "#else"]))
            {
                if (template.nextElementSibling?.tagName == "TEMPLATE" && contains(template.nextElementSibling.getAttributeNames(), ["#else-if", "#else"]))
                {
                    DirectiveProcessor.decomposeDirectives(template.nextElementSibling as HTMLTemplateElement);
                }

                if (attributes.includes("#for") || injectorKey)
                {
                    const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                    template.removeAttribute("#for");

                    if (injectorKey)
                    {
                        template.removeAttribute(injectorKey);
                    }

                    innerTemplate.removeAttribute("#if");
                    innerTemplate.removeAttribute("#else-if");
                    innerTemplate.removeAttribute("#else");

                    organize(template, innerTemplate);
                }
            }
            else if (attributes.includes("#for") && injectorKey)
            {
                const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                template.removeAttribute(injectorKey);

                innerTemplate.removeAttribute("#for");

                organize(template, innerTemplate);
            }
            else if (injectorKey)
            {
                template[INJECTOR] = injectorKey.split(":")[1];
            }
        }
    }

    private static processConditionalDirectives(host: Bindable<Element|Node>, template: HTMLTemplateElement, parent: Node, scope: Indexer): void
    {
        const start = document.createComment("if-directive-start");
        const end   = document.createComment("if-directive-end");

        const expressions:   Array<[IExpression, HTMLTemplateElement]> = [];
        const subscriptions: Array<ISubscription>                      = [];

        const notify = () =>
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

        const listener = { notify };

        const expression = parse(template.getAttribute("#if")!);

        subscriptions.push(ObserverVisitor.observe(expression, scope, listener));

        expressions.push([expression, template]);

        let simbling = template.nextElementSibling;

        while (simbling && typeGuard<Element, HTMLTemplateElement>(simbling, x => x.tagName == "TEMPLATE"))
        {
            if (simbling.hasAttribute("#else-if"))
            {
                const expression = parse(simbling.getAttribute("#else-if")!);

                subscriptions.push(ObserverVisitor.observe(expression, scope, listener));

                expressions.push([expression, simbling]);

                const next = simbling.nextElementSibling;

                simbling.remove();

                simbling = next;
            }
            else if (simbling.hasAttribute("#else"))
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

        notify();
    }

    private static processForDirectives(host: Bindable<Element|Node>, template: HTMLTemplateElement, parent: Node, scope: Indexer): void
    {
        const start = document.createComment("for-directive-start");
        const end   = document.createComment("for-directive-end");

        const forExpression = /(?:const|var|let)\s+(.*)\s+(in|of)\s+(.*)/;
        const rawExpression = template.getAttribute("#for")!;

        if (!forExpression.test(rawExpression))
        {
            throw new Error(`Invalid #for directive expression: ${rawExpression}`);
        }

        const [, aliasExpression, operator, iterableExpression] = forExpression.exec(rawExpression)!.map(x => x.trim());

        const destructured = aliasExpression.startsWith("[") || aliasExpression.startsWith("{");

        const expression = parse(iterableExpression);

        let cache: Array<[unknown, Array<ChildNode>]> = [];

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
                    const content = template.content.cloneNode(true) as Element;

                    content.normalize();

                    const mergedScope = destructured ?
                        { ...Evaluate.pattern(scope, (parse(`(${aliasExpression}) => 0`) as IArrowFunctionExpression).parameters[0], element), ...scope }
                        : { ...scope, [aliasExpression]: element };

                    TemplateProcessor.process(host, content, mergedScope);

                    if (index < cache.length)
                    {
                        for (const child of cache[index][1])
                        {
                            child.remove();
                            TemplateProcessor.clear(child);
                        }

                        cache[index] = [element, Array.from(content.childNodes)];

                        changedTree = true;
                    }
                    else
                    {
                        cache.push([element, Array.from(content.childNodes)]);
                    }

                    tree.appendChild(content);
                }
                else if (changedTree)
                {
                    for (const child of cache[index][1])
                    {
                        tree.appendChild(child);
                    }
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
                    for (const [, childs] of cache.splice(elements.length))
                    {
                        for (const child of childs)
                        {
                            child.remove();
                            TemplateProcessor.clear(child);
                        }
                    }
                }

                if (elements.length > 0)
                {
                    iterator(elements, action);
                }

                end.parentNode.insertBefore(tree, end);
            };
        };

        const notify = notifyFactory(operator == "in" ? forInIterator : forOfIterator);

        const subscription = ObserverVisitor.observe(expression, scope, { notify });

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        notify();
    }

    private static processInjectorDirectives(host: Bindable<Element>, template: HTMLTemplateElementDirective, parent: Node, scope: Indexer): void
    {
        const start = document.createComment("injector-directive-start");
        const end   = document.createComment("injector-directive-end");

        const injectorKey   = template[INJECTOR]!;
        const injectorScope = template.getAttribute(`#injector:${injectorKey}`);

        const injectedTemplates = host[INJECTED_TEMPLATES] = host[INJECTED_TEMPLATES] ?? new Map<string, Nullable<HTMLTemplateElement>>();

        if (!injectedTemplates.has(injectorKey))
        {
            const injectionTemplate = host.querySelector<HTMLTemplateElement>(`template[\\#inject\\:${injectorKey}]`);

            if (injectionTemplate)
            {
                injectedTemplates.set(injectorKey, injectionTemplate);

                injectionTemplate.remove();
            }
        }

        const injectionTemplate = injectedTemplates.get(injectorKey) ?? template;

        DirectiveProcessor.decomposeDirectives(injectionTemplate);

        const scopeExpression = injectionTemplate.getAttribute(`#inject:${injectorKey}`) || "scope";

        const expression = parse(`(${injectorScope || "{ }"})`);

        const proxyScope = createProxy(scope);

        const isDestructured = scopeExpression.startsWith("{");

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        let subscription: ISubscription;

        const pattern = (parse(`(${scopeExpression}) => 0`) as IArrowFunctionExpression).parameters[0];

        const apply = (outterScope: Indexer) =>
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
                TemplateProcessor.clear(simbling);
            }

            const { elementScope, scopeAlias } = isDestructured ?
                { elementScope: Evaluate.pattern(scope, pattern, expression.evaluate(proxyScope)), scopeAlias: "" }
                : { elementScope: expression.evaluate(proxyScope) as Indexer, scopeAlias: scopeExpression };

            const mergedScope = isDestructured ?
                { ...elementScope, ...outterScope }
                : { [scopeAlias]: elementScope, ...outterScope };

            const content = document.importNode(injectionTemplate.content, true);

            content.normalize();

            TemplateProcessor.process(host, content, mergedScope);

            end.parentNode.insertBefore(content, end);
        };

        subscription = ObserverVisitor.observe(expression, proxyScope, { notify: () => apply(host[SCOPE] as Indexer) });

        if (!host[PROCESSED])
        {
            const onAfterBinded = host[ON_PROCESS];

            host[ON_PROCESS] = function(outterScope: Indexer)
            {
                if (onAfterBinded)
                {
                    onAfterBinded.call(this, outterScope);
                }

                apply(outterScope);

                host[ON_PROCESS] = onAfterBinded;
            };
        }
        else
        {
            apply(host[SCOPE] as Indexer);
        }
    }

    public static process(host: Element|Node, template: HTMLTemplateElementDirective, scope: Indexer): void
    {
        if (!template.parentNode)
        {
            throw new Error("Cannot process orphan templates");
        }

        const parent = template.parentNode;

        DirectiveProcessor.decomposeDirectives(template);

        if (template.hasAttribute("#if"))
        {
            DirectiveProcessor.processConditionalDirectives(host, template, parent, scope);
        }
        else if (template.hasAttribute("#for"))
        {
            DirectiveProcessor.processForDirectives(host, template, parent, scope);
        }
        else if (!!template[INJECTOR] && "querySelector" in host)
        {
            DirectiveProcessor.processInjectorDirectives(host, template, parent, scope);
        }
    }
}