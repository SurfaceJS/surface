import { Queue }              from "@surface/collection";
import { Delegate, runAsync } from "@surface/core";
import Scheduler              from "./scheduler";
import Watcher                from "./watcher";

export default class ChangeTracker
{
    private readonly callbackQueue: Queue<Delegate> = new Queue();
    private readonly interval:      number;
    private readonly scheduler:     Scheduler;
    private readonly watchers:      Set<Watcher>    = new Set();

    private running: boolean = false;

    public constructor(scheduler: Scheduler, interval: number)
    {
        this.interval  = interval;
        this.scheduler = scheduler;
    }

    private async execute(): Promise<void>
    {
        while (this.running)
        {
            for (const watcher of this.watchers)
            {
                this.scheduler.enqueue(() => watcher.detectChange(), "high");
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