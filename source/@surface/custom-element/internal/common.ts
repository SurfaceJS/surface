import { Indexer, Nullable } from "@surface/core";
import ISubscription         from "@surface/reactive/interfaces/subscription";
import { nativeEvents }      from "./native-events";
import { interpolation }     from "./patterns";
import { SUBSCRIPTIONS }     from "./symbols";
import { Subscriber }        from "./types";

const wrapper = { "Window": /* istanbul ignore next */ function () { return; } }["Window"] as object as typeof Window;

wrapper.prototype = window;
wrapper.prototype.constructor = wrapper;

const windowWrapper = wrapper.prototype;

export function createProxy(context: Indexer): Indexer
{
    const handler: ProxyHandler<Indexer> =
    {
        get: (target, key) => key in target ? target[key as string] : (windowWrapper as Indexer)[key as string],
        has: (target, key) => key in target || key in windowWrapper,
        getOwnPropertyDescriptor: (target, key) =>
            Object.getOwnPropertyDescriptor(target, key) ?? Object.getOwnPropertyDescriptor(windowWrapper, key)
    };

    return new Proxy(context, handler);
}

export function pushSubscription(target: Subscriber, subscription: ISubscription): void
{
    (target[SUBSCRIPTIONS] = target[SUBSCRIPTIONS] ?? []).push(subscription);
}

export function scapeBrackets(value: string)
{
    return value.replace(/(?<!\\)\\{/g, "{").replace(/\\\\{/g, "\\");
}

export function* iterateExpresssionAttributes(element: Element): Iterable<Attr>
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
        else if
        (
            attribute.name.startsWith(":")
            || attribute.name.startsWith("on:")
            || (interpolation.test(attribute.value) && !(/^on\w/.test(attribute.name) || nativeEvents.includes(attribute.name)))
        )
        {
            yield attribute;
        }
        else
        {
            attribute.value = scapeBrackets(attribute.value);
        }
    }
}

export function* iterateRange(start: ChildNode, end: ChildNode): Iterable<ChildNode>
{
    let simbling: Nullable<ChildNode> = null;

    while ((simbling = start.nextSibling) && simbling != end)
    {
        yield simbling;
    }
}