import type { Subscription } from "@surface/core";
import { setValue }          from "@surface/core";
import observe               from "./observe.js";
import type ObservablePath   from "./types/observable-path";

export default function bind(left: object, leftPath: ObservablePath, right: object, rightPath: ObservablePath): Subscription
{
    const leftListener  = (value: unknown): void => setValue(value, right, ...rightPath);
    const rightListener = (value: unknown): void => setValue(value, left, ...leftPath);

    const leftSubscription  = observe(left, [leftPath], leftListener, true);
    const rightSubscription = observe(right, [rightPath], rightListener);

    return { unsubscribe: () => (leftSubscription.unsubscribe(), rightSubscription.unsubscribe()) };
}
