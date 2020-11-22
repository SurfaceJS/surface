import { Delegate, getValue, setValue } from "@surface/core";
import AsyncReactive                    from "./async-reactive";
import ISubscription                    from "./interfaces/subscription";
import { scheduler }                    from "./workers";

export default class DataBind
{
    public static observe(target: object, observables: string[][], listener: Delegate<[unknown]>, lazy: boolean = false): ISubscription
    {
        const subscriptions = observables.map(path => DataBind.oneWay(target, path, listener, lazy));

        return { unsubscribe: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
    }

    public static oneWay(root: object, path: string[], listener: Delegate<[unknown]>, lazy: boolean = false): ISubscription
    {
        const observer = AsyncReactive.observe(root, path, scheduler);

        const subscription = observer.subscribe(listener);

        if (!lazy)
        {
            observer.notify(getValue(root, ...path));
        }

        return subscription;
    }

    public static twoWay(left: object, leftPath: string[], right: object, rightPath: string[]): [ISubscription, ISubscription]
    {
        const leftListener = (value: unknown): void => setValue(value, right, ...rightPath);
        const rightListener = (value: unknown): void => setValue(value, left, ...leftPath);

        const leftSubscription  = DataBind.oneWay(left, leftPath, leftListener);
        const rightSubscription = DataBind.oneWay(right, rightPath, rightListener);

        return [leftSubscription, rightSubscription];
    }
}