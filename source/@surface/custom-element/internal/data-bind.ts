import { Delegate, getValue, setValue } from "@surface/core";
import ISubscription                    from "./interfaces/subscription";
import Metadata                         from "./metadata/metadata";
import Watcher                          from "./watcher";
import { changeTracker } from "./workers";

export default class DataBind
{
    public static observe(target: object, observables: string[][], listener: Delegate<[unknown]>, lazy: boolean = false): ISubscription
    {
        const subscriptions = observables.map(path => DataBind.oneWay(target, path, listener, lazy));

        return { unsubscribe: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
    }

    public static oneWay(root: object, path: string[], listener: Delegate<[unknown]>, lazy: boolean = false): ISubscription
    {
        const watchers = Metadata.from(root).watchers;

        const key = path.join("\u{1}");

        let watcher = watchers.get(key);

        if (!watcher)
        {
            watchers.set(key, watcher = new Watcher(root, path));
        }

        changeTracker.attach(watcher);

        watcher.observer.subscribe(listener);

        const subscription =
        {
            unsubscribe: () =>
            {
                watcher!.observer.unsubscribe(listener);

                if (watcher!.observer.size == 0)
                {
                    watchers.delete(key);

                    changeTracker.dettach(watcher!);
                }
            },
        };

        if (!lazy)
        {
            watcher.observer.notify(getValue(root, path));
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