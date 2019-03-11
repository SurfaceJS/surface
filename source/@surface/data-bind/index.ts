import { Indexer }         from "@surface/core";
import { Injector, METADATA, Observable, Subscription } from "@surface/observer/property-observer";

type BindMap<TLeft extends Indexer, TRight extends Indexer> =
{
    emmiter:  { target: TLeft  & Observable, key: string },
    receiver: { target: TRight & Observable, key: string }
};

export default class DataBind
{
    public static oneWay<TLeft extends Indexer, TRight extends Indexer>(bindMap: BindMap<TLeft, TRight>): Subscription
    {
        const { emmiter, receiver } = bindMap;

        const listener = (x: unknown) => receiver.target[receiver.key] = x as TRight[keyof TRight];

        Injector.observe(emmiter.target, emmiter.key).subscribe(listener);

        const metadata = emmiter.target[METADATA]!;

        if (!metadata.subscriptions.has(emmiter.target))
        {
            metadata.subscriptions.set(emmiter.target, []);
        }

        const subscription = { action: listener, key: emmiter.key };

        metadata.subscriptions.get(emmiter.target)!.push(subscription);

        return subscription;
    }

    public static twoWay<TLeft extends Indexer, TRight extends Indexer>(bindMap: BindMap<TLeft, TRight>): void
    {
        DataBind.oneWay(bindMap);
        DataBind.oneWay({ emmiter: bindMap.receiver, receiver: bindMap.emmiter });
    }
}