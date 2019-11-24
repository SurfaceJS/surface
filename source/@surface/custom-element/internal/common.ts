import { Indexer }       from "@surface/core";
import ISubscription     from "@surface/reactive/interfaces/subscription";
import { SUBSCRIPTIONS } from "./symbols";
import { Subscriber }    from "./types";

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