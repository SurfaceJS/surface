import { Constructor, overrideConstructor } from "@surface/core";
import Reactive                             from "./reactive";
import ISubscription                        from "./interfaces/subscription";
import StaticMetadata                       from "./static-metadata";

export function observe<T extends object>(property: keyof T): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U, propertyKey: string) =>
    {
        const metadata = StaticMetadata.from(target.constructor);

        const action = (instance: object) =>
        {
            let subscription: ISubscription;

            const notify = (value: unknown) => (instance as Record<string, Function>)[propertyKey](value);

            subscription = Reactive
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

    const action = (instance: InstanceType<T>) => (metadata.actions.forEach(x => x(instance)), instance);

    return overrideConstructor(target, action);
}

export function notify<T extends object>(...properties: Array<keyof T>): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U, propertyKey: string) =>
    {
        const action = (instance: object) =>
        {
            const subscriptions: Array<ISubscription> = [];

            for (const property of properties)
            {
                subscriptions.push(Reactive.observe(instance, propertyKey).observer.subscribe({ notify: () => Reactive.notify(instance, property as string)}));
            }

            return { dispose: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
        };

        StaticMetadata.from(target.constructor).actions.push(action);
    };
}