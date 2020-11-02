import { Constructor, IDisposable } from "@surface/core";
import ISubscription                from "./interfaces/subscription";
import Reactive                     from "./reactive";
import StaticMetadata               from "./static-metadata";

export function observe<T extends object>(property: keyof T): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U, propertyKey: string) =>
    {
        const metadata = StaticMetadata.from(target.constructor);

        const action = (instance: object): IDisposable =>
        {
            const notify = (value: unknown): unknown => (instance as Record<string, Function>)[propertyKey](value);

            const subscription = Reactive
                .observe(instance, property as string).observer
                .subscribe({ notify });

            return { dispose: () => subscription.unsubscribe() };
        };

        metadata.actions.push(action);
    };
}

export function observable<T extends Constructor>(target: T): T
{
    const metadata = StaticMetadata.from(target);

    const handler: ProxyHandler<T> =
    {
        construct: (target, args, newTarget) =>
        {
            const instance = Reflect.construct(target, args, newTarget) as InstanceType<T>;

            metadata.actions.forEach(x => x(instance));

            return instance;
        },
    };

    return new Proxy(target, handler);
}

export function notify<T extends object>(...properties: (keyof T)[]): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U, propertyKey: string) =>
    {
        const action = (instance: object): IDisposable =>
        {
            const subscriptions: ISubscription[] = [];

            for (const property of properties)
            {
                subscriptions.push(Reactive.observe(instance, propertyKey).observer.subscribe({ notify: () => Reactive.notify(instance, property as string) }));
            }

            return { dispose: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
        };

        StaticMetadata.from(target.constructor).actions.push(action);
    };
}