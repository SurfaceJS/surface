import type { Delegate, Subscription } from "@surface/core";
import { getValue }                    from "@surface/core";
import AsyncObserver                   from "../reactivity/async-observer.js";
import { scheduler }                   from "../singletons.js";
import type ObservablePath             from "./types/observable-path";

export default function observe(target: object, observables: ObservablePath[], listener: Delegate<[unknown]>, lazy: boolean = false): Subscription
{
    const subscriptions: Subscription[] = [];

    for (const path of observables)
    {
        const observer = AsyncObserver.observe(target, path, scheduler);

        subscriptions.push(observer.subscribe(listener));

        if (!lazy)
        {
            listener(getValue(target, ...path));
        }
    }

    return { unsubscribe: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
}
