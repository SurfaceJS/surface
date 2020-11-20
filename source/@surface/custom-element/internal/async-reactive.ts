import { CancellationTokenSource, Indexer, hasValue, privatesFrom } from "@surface/core";
import Reactive, { IObserver, Metadata, Mode }                      from "@surface/reactive";
import Scheduler                                                    from "./scheduler";

export default class AsyncReactive extends Reactive
{
    private readonly scheduler: Scheduler;
    private cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();

    public constructor(root: object, path: string[], mode: Mode, scheduler: Scheduler)
    {
        super(root, path, mode);

        this.scheduler = scheduler;
    }

    public static observe(root: object, path: string[], mode?: Mode): IObserver;
    public static observe(root: object, path: string[], scheduler: Scheduler, mode?: Mode): IObserver;
    public static observe(root: object, path: string[], ...args: [Mode?] | [Scheduler, Mode?]): IObserver
    {
        const [scheduler, mode] = args.length == 2
            ? args as [Scheduler, Mode]
            : args.length == 1
                ? typeof args[0] == "string"
                    ? [undefined, args[0]]
                    : [args[0], "strict" as Mode]
                : [undefined, "strict" as Mode];

        if (scheduler)
        {
            const key = path.join("\u{fffff}");

            const metadata = Metadata.from(root);

            let reactive = metadata.reactivePaths.get(key) as AsyncReactive | undefined;

            if (!reactive)
            {
                metadata.reactivePaths.set(key, reactive = new AsyncReactive(root, path, mode, scheduler));
            }

            return reactive.observer;
        }

        return Reactive.observe(root, path, mode);
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
                const privates = privatesFrom(root as object);

                privates[key] = property;

                const action = (): void =>
                {
                    const oldValue = privates[key];
                    const newValue = (root as unknown as Indexer)[key];

                    if (!Object.is(oldValue, newValue))
                    {
                        privates[key] = newValue;

                        const tracking = Metadata.of(root)!.trackings.get(key)!;

                        for (const [reactive, path] of tracking)
                        {
                            if (path.length > 0)
                            {
                                reactive.unobserve(oldValue as Object, path);
                                reactive.observe(newValue as Object, path);
                            }

                            reactive.notify();
                        }
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