import { Delegate, getValue, setValue } from "@surface/core";
import ChangeTracker                    from "./change-tracker";
import ISubscription                    from "./interfaces/subscription";

export default class DataBind
{
    public static observe(target: object, observables: string[][], listener: Delegate<[unknown]>, lazy: boolean = false): ISubscription
    {
        const subscriptions = observables.map(path => DataBind.oneWay(target, path, listener, lazy));

        return { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) };
    }

    public static oneWay(root: object, path: string[], listener: Delegate<[unknown]>, lazy: boolean = false): ISubscription
    {
        const observer = ChangeTracker.instance.observe(root, path);

        const subscription = observer.subscribe(listener);

        if (!lazy)
        {
            observer.notify(getValue(root, path));
        }

        return subscription;
    }

    public static twoWay(left: object, leftPath: string[], right: object, rightPath: string[]): [ISubscription, ISubscription]
    {
        const leftListener = (value: unknown): void => setValue(right, rightPath, value);
        const rightListener = (value: unknown): void => setValue(left, leftPath, value);

        const leftSubscription  = DataBind.oneWay(left, leftPath, leftListener);
        const rightSubscription = DataBind.oneWay(right, rightPath, rightListener);

        return [leftSubscription, rightSubscription];
    }
}