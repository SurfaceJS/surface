import { Indexer, Nullable } from "@surface/core";

const wrapper = { "Window": /* istanbul ignore next */ function () { return; } }["Window"] as object as typeof Window;

wrapper.prototype = window;
wrapper.prototype.constructor = wrapper;

const windowWrapper = wrapper.prototype;

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

export function scapeBrackets(value: string)
{
    return value.replace(/(?<!\\)\\{/g, "{").replace(/\\\\{/g, "\\");
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