import { CancellationTokenSource, Indexer, hasValue } from "@surface/core";
import Reactive, { IObserver, Metadata }              from "@surface/reactive";
import Scheduler                                      from "./scheduler";

export default class AsyncReactive extends Reactive
{
    private readonly scheduler: Scheduler;
    private cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();

    public constructor(root: object, path: string[], scheduler: Scheduler)
    {
        super(root, path);

        this.scheduler = scheduler;
    }

    public static observe(root: object, path: string[], scheduler?: Scheduler): IObserver
    {
        if (scheduler)
        {
            const key = path.join("\u{fffff}");

            const metadata = Metadata.from(root);

            let reactive = metadata.reactivePaths.get(key) as AsyncReactive | undefined;

            if (!reactive)
            {
                metadata.reactivePaths.set(key, reactive = new AsyncReactive(root, path, scheduler));
            }

            return reactive.observer;
        }

        return Reactive.observe(root, path);
    }

    public observe(root: Object, path: string[]): void
    {
        if (root instanceof HTMLElement)
        {
            const [key, ...keys] = path;

            const metadata = Metadata.from(root);

            let tracking = metadata.trackings.get(key);

            const property = (root as unknown as Indexer)[key];

            if (!tracking)
            {
                const action = (event: Event): void =>
                {
                    event.stopImmediatePropagation();

                    const tracking = Metadata.of(root)!.trackings.get(key)!;

                    for (const [reactive] of tracking)
                    {
                        reactive.notify();
                    }
                };

                root.addEventListener("input", action);

                this.observeProperty(root, key);

                metadata.trackings.set(key, tracking = new Map());
            }

            tracking.set(this, keys);

            if (keys.length > 0 && hasValue(property))
            {
                this.observe(property, keys);
            }
        }
        else
        {
            super.observe(root, path);
        }
    }

    public notify(): void
    {
        const task = (): void =>
        {
            const value = this.getValue(this.root, this.path);

            this.observer.notify(value);
        };

        this.cancellationTokenSource.cancel();

        this.cancellationTokenSource = new CancellationTokenSource();

        this.scheduler.enqueue(task, "high", this.cancellationTokenSource.token);
    }
}