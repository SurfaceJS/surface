import type { Indexer }                      from "@surface/core";
import { CancellationTokenSource, hasValue } from "@surface/core";
import Observer, { Metadata }                from "@surface/observer";
import type Scheduler                        from "../processors/scheduler.js";

export default class AsyncObserver extends Observer
{
    private readonly scheduler: Scheduler;
    private cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();

    public constructor(root: object, path: string[], scheduler: Scheduler)
    {
        super(root, path);

        this.scheduler = scheduler;
    }

    protected static observePath(root: Object, path: string[], observer: Observer): void
    {
        if (root instanceof HTMLElement && (root.contentEditable == "true" || root.nodeName == "INPUT"))
        {
            const [key, ...keys] = path;

            const metadata = Metadata.from(root);

            this.observeComputed(root, key, metadata, observer);

            let subject = metadata.subjects.get(key);

            if (!subject)
            {
                const action = (event: Event): void =>
                {
                    event.stopImmediatePropagation();

                    for (const [observer] of Metadata.from(root).subjects.get(key)!)
                    {
                        observer.notify();
                    }
                };

                root.addEventListener("input", action);

                this.observeProperty(root, key);

                metadata.subjects.set(key, subject = new Map());
            }

            subject.set(observer, keys);

            const property = (root as unknown as Indexer)[key];

            if (keys.length > 0 && hasValue(property))
            {
                this.observePath(property, keys, observer);
            }
        }
        else
        {
            super.observePath(root, path, observer);
        }
    }

    public static observe(root: object, path: string[], scheduler?: Scheduler): Observer
    {
        if (scheduler)
        {
            const key = path.join("\u{fffff}");

            const metadata = Metadata.from(root);

            let observer = metadata.observers.get(key);

            if (!observer)
            {
                this.observePath(root, path, observer = new AsyncObserver(root, path, scheduler));

                metadata.observers.set(key, observer);
            }

            return observer;
        }

        return super.observe(root, path);
    }

    public notify(): void
    {
        const task = (): void => super.notify();

        this.cancellationTokenSource.cancel();

        this.cancellationTokenSource = new CancellationTokenSource();

        void this.scheduler.enqueue(task, "high", this.cancellationTokenSource.token);
    }
}