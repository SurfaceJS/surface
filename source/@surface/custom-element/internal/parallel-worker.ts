import { Queue }              from "@surface/collection";
import { Delegate, runAsync } from "@surface/core";

export default class ParallelWorker
{
    public static readonly default = new ParallelWorker();

    private readonly normalQueue: Queue<Delegate> = new Queue();
    private readonly lowQueue:    Queue<Delegate> = new Queue();
    private readonly interval:     number;

    private currentExecution: Promise<void> = Promise.resolve();
    private running:          boolean       = false;

    public constructor(interval: number = 16.17)
    {
        this.interval = interval;
    }

    public static async whenDone(): Promise<void>
    {
        return ParallelWorker.default.whenDone();
    }

    public static run(action: Delegate, priority: "normal" | "low" = "normal"): void
    {
        ParallelWorker.default.run(action, priority);
    }

    private async nextFrame(): Promise<number>
    {
        return new Promise(resolve => window.requestAnimationFrame(resolve));
    }

    private async processQueue(queue: Queue<Delegate>, ...higher: Queue<Delegate>[]): Promise<void>
    {
        let expended = 0;

        while (queue.length > 0)
        {
            const action = queue.dequeue()!;

            const start = window.performance.now();

            action();

            const end = window.performance.now();

            expended += end - start;

            if (expended > this.interval)
            {
                expended = 0;

                await this.nextFrame();
            }

            if (higher.some(x => x.length > 0))
            {
                await this.execute();
            }
        }
    }

    private async execute(): Promise<void>
    {
        try
        {
            await this.processQueue(this.normalQueue);
            await this.processQueue(this.lowQueue, this.normalQueue);
        }
        finally
        {
            this.normalQueue.clear();
            this.lowQueue.clear();
        }
    }

    public async whenDone(): Promise<void>
    {
        return this.currentExecution;
    }

    public run(action: Delegate, priority: "normal" | "low" = "normal"): void
    {
        switch (priority)
        {
            case "low":
                this.lowQueue.enqueue(action);
                break;
            case "normal":
            default:
                this.normalQueue.enqueue(action);
                break;
        }

        if (!this.running)
        {
            this.running = true;

            this.currentExecution = runAsync(this.execute.bind(this)).finally(() => this.running = false);
        }
    }
}