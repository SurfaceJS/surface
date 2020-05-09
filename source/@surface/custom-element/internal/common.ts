import { Indexer, Nullable } from "@surface/core";

const wrapper = { "Window": /* istanbul ignore next */ function () { return; } }["Window"] as object as typeof Window;

wrapper.prototype = window;
wrapper.prototype.constructor = wrapper;

const windowWrapper = wrapper.prototype;

const TEMPLATE_OWNER = Symbol("custom-element:template-owner");

export function createScope(scope: Indexer): Indexer
{
    scope["$class"] = classMap;
    scope["$style"] = styleMap;

    const handler: ProxyHandler<Indexer> =
    {
        get: (target, key) => key in target ? target[key as string] : (windowWrapper as Indexer)[key as string],
        has: (target, key) => key in target || key in windowWrapper,
        getOwnPropertyDescriptor: (target, key) =>
            Object.getOwnPropertyDescriptor(target, key) ?? Object.getOwnPropertyDescriptor(windowWrapper, key)
    };

    return new Proxy(scope, handler);
}

export function classMap(classes: Record<string, boolean>): string
{
    return Object.entries(classes)
        .filter(x => x[1])
        .map(x => x[0])
        .join(" ");
}

export function domPath(element: Element): string
{
    const stack: Array<Array<string>> = [];

    const entry = [getTag(element)];

    if (element.parentNode)
    {
        const index = Array.from(element.parentNode.childNodes).indexOf(element as ChildNode);

        if (index > 0)
        {
            entry.push(`...${index} other(s) node(s)`);
        }
    }

    let parent = element.parentNode?.nodeType == Node.DOCUMENT_FRAGMENT_NODE
        ? getTemplateOwner(element.parentNode)
        : element.parentNode;

    stack.push(entry.reverse());

    while (parent)
    {
        const parentEntry = [getTag(parent as Element)];

        if (parent.parentNode)
        {
            const index = Array.from(parent.parentNode.childNodes).indexOf(parent as Node as ChildNode);

            if (index > 0)
            {
                parentEntry.push(`...${index} other(s) node(s)`);
            }

            stack.push(parentEntry.reverse());
        }

        parent = parent.parentNode?.nodeType == Node.DOCUMENT_FRAGMENT_NODE
            ? getTemplateOwner(parent.parentNode)
            : parent.parentNode;
    }

    return stack.reverse().map((entry, i) => entry.map(value => "\t".repeat(i) + value).join("\n")).join("\n");
}

export function getTag(element: Element): string
{
    return element.nodeType == Node.DOCUMENT_FRAGMENT_NODE
        ? element.nodeName
        : element.outerHTML.replace(element.innerHTML, "").replace(`</${element.nodeName.toLowerCase()}>`, "");
}

export function getTemplateOwner(element: Node & { [TEMPLATE_OWNER]?: HTMLTemplateElement }): HTMLTemplateElement|null
{
    return element[TEMPLATE_OWNER] ?? null;
}

export function scapeBrackets(value: string)
{
    return value.replace(/(?<!\\)\\{/g, "{").replace(/\\\\{/g, "\\");
}

export function setTemplateOwner(element: Node & { [TEMPLATE_OWNER]?: HTMLTemplateElement }, template: HTMLTemplateElement): void
{
    element[TEMPLATE_OWNER] = template;
}

export function styleMap(rules: Record<string, boolean>): string
{
    return Object.entries(rules)
        .map(([key, value]) => `${key}: ${value}` )
        .join("; ");
}

export function* enumerateRange(start: ChildNode, end: ChildNode): Iterable<ChildNode>
{
    let simbling: Nullable<ChildNode> = null;

    while ((simbling = start.nextSibling) && simbling != end)
    {
        yield simbling;
    }
}