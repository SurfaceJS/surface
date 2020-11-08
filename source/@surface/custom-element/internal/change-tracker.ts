import { Queue }              from "@surface/collection";
import { Delegate, runAsync } from "@surface/core";
import IObserver              from "./interfaces/observer";
import ParallelWorker         from "./parallel-worker";
import Watcher                from "./watcher";

export default class ChangeTracker
{
    public static readonly instance: ChangeTracker = new ChangeTracker();

    private readonly callbackQueue: Queue<[resolve: Delegate, reject: Delegate<[Error]>]> = new Queue();
    private readonly tracks: Map<object, Map<string, Watcher>>                            = new Map();

    private readonly interval: number = 16.17;
    private running:  boolean = false;

    private detectChanges(): void
    {
        for (const watchers of this.tracks.values())
        {
            for (const watcher of watchers.values())
            {
                ParallelWorker.run(() => watcher.detectChange(), "high");
            }
        }
    }

    private async execute(): Promise<void>
    {
        while (this.running)
        {
            const start = window.performance.now();

            try
            {
                this.detectChanges();

                await ParallelWorker.whenDone();

                this.resolve();
            }
            catch (error)
            {
                this.resolve(error);
            }

            const end = window.performance.now();

            const expended = end - start;

            // istanbul ignore if
            if (expended > this.interval)
            {
                await this.sleep(0);
            }
            else
            {
                await this.sleep(this.interval - expended);
            }
        }
    }

    private resolve(error?: Error): void
    {
        while (this.callbackQueue.length > 0)
        {
            const [resolve, reject] = this.callbackQueue.dequeue()!;

            error ? reject(error) : resolve();
        }
    }

    private async sleep(timeout: number): Promise<void>
    {
        return new Promise(resolve => window.setTimeout(resolve, timeout));
    }

    public clear(): void
    {
        this.tracks.clear();
    }

    public async nextTick(): Promise<void>
    {
        return this.running
            ? new Promise((resolve, reject) => this.callbackQueue.enqueue([resolve, reject]))
            : Promise.resolve();
    }

    public observe(root: object, path: string[]): IObserver
    {
        let watchers = this.tracks.get(root);

        if (!watchers)
        {
            this.tracks.set(root, watchers = new Map());
        }

        const key = path.join("\u{1}");

        let watcher = watchers.get(key);

        if (!watcher)
        {
            watchers.set(key, watcher = new Watcher(root, path));
        }

        const disposeGarbage = (): void =>
        {
            if (watcher!.observer.size == 0)
            {
                watchers!.delete(key);
            }

            if (watchers!.size == 0)
            {
                this.tracks.delete(root);
            }
        };

        const handler: ProxyHandler<IObserver> =
        {
            get: (target, key: keyof IObserver): unknown =>
            {
                switch (key)
                {
                    case "unsubscribe":
                        return (action: Delegate<[unknown]>): void => (target.unsubscribe(action), disposeGarbage());
                    default:
                        return target[key];
                }
            },
        };

        return new Proxy(watcher.observer, handler);
    }

    public start(): void
    {
        if (!this.running)
        {
            this.running = true;

            void runAsync(this.execute.bind(this));
        }
    }

    public stop(): void
    {
        this.running = false;
    }
}