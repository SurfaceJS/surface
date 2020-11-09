import { Queue }              from "@surface/collection";
import { Delegate, runAsync } from "@surface/core";
import ParallelWorker         from "./parallel-worker";
import Watcher                from "./watcher";

export default class ChangeTracker
{
    public static readonly instance: ChangeTracker = new ChangeTracker(20);

    private readonly callbackQueue: Queue<Delegate> = new Queue();
    private readonly watchers:        Set<Watcher>    = new Set();
    private readonly interval:      number;

    private running: boolean = false;

    public constructor(interval: number)
    {
        this.interval = interval;
    }

    private async execute(): Promise<void>
    {
        while (this.running)
        {
            for (const watcher of this.watchers)
            {
                ParallelWorker.run(() => watcher.detectChange(), "high");
            }

            this.resolve();

            await this.suspend(this.interval);
        }
    }

    private resolve(): void
    {
        while (this.callbackQueue.length > 0)
        {
            this.callbackQueue.dequeue()!();
        }
    }

    private async suspend(timeout?: number): Promise<void>
    {
        return new Promise(resolve => window.setTimeout(resolve, timeout));
    }

    public clear(): void
    {
        this.watchers.clear();
    }

    public async nextCicle(): Promise<void>
    {
        return this.running
            ? new Promise(resolve => this.callbackQueue.enqueue(resolve))
            : Promise.resolve();
    }

    public attach(watcher: Watcher): void
    {
        this.watchers.add(watcher);
    }

    public dettach(watcher: Watcher): void
    {
        this.watchers.delete(watcher);
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