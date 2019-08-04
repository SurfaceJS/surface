import { Indexer }     from "@surface/core";
import IListener       from "@surface/reactive/interfaces/listener";
import ReactiveVisitor from "@surface/reactive/internal/reactive-visitor";
import Reactive        from "../../reactive";
import IReactor        from "../../reactive/interfaces/reactor";

export default class ObserverVisitor extends ReactiveVisitor
{
    public constructor(listener: IListener, scope: Indexer)
    {
        super(listener, scope);
    }

    protected reactivate(target: Indexer, key: string): IReactor
    {
        if (!this.dependency)
        {
            const [reactor, observer] = Reactive.observe(target, key);

            this.subscriptions.push(observer.subscribe(this.listener));

            if (target instanceof HTMLInputElement)
            {
                type Key = keyof HTMLInputElement;

                const action = function (this: HTMLInputElement)
                {
                    observer.notify(this[key as Key]);
                };

                target.addEventListener("input", action);

                const subscription = { unsubscribe: () => target.removeEventListener("input", action) };

                this.subscriptions.push(subscription);
            }

            return reactor;
        }
        else
        {
            const reactor = Reactive.observe(target, key)[0];

            reactor.setDependency(key, this.dependency);

            return reactor;
        }
    }
}