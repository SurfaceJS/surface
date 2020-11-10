import { Queue }              from "@surface/collection";
import { Delegate, runAsync } from "@surface/core";

export default class ParallelWorker
{
    private static readonly instance = new ParallelWorker(16.17);

    private readonly highQueue:   Queue<Delegate> = new Queue();
    private readonly lowQueue:    Queue<Delegate> = new Queue();
    private readonly normalQueue: Queue<Delegate> = new Queue();
    private readonly interval:    number;

    private currentExecution: Promise<void> = Promise.resolve();
    private running:          boolean       = false;

    private constructor(interval: number)
    {
        this.interval = interval;
    }

    public static async whenDone(): Promise<void>
    {
        return ParallelWorker.instance.currentExecution;
    }

    public static run(action: Delegate, priority: "high" | "normal" | "low" = "normal"): void
    {
        ParallelWorker.instance.run(action, priority);
    }

    private async nextFrame(): Promise<number>
    {
        return new Promise(resolve => window.requestAnimationFrame(resolve));
    }

    private async processQueue(queue: Queue<Delegate>, hasPriorityChange?: () => boolean): Promise<void>
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

            if (hasPriorityChange?.())
            {
                await this.execute();
            }
        }
    }

    private async execute(): Promise<void>
    {
        try
        {
            await this.processQueue(this.highQueue);
            await this.processQueue(this.normalQueue, () => this.highQueue.length > 0);
            await this.processQueue(this.lowQueue, () => this.highQueue.length > 0 || this.normalQueue.length > 0);
        }
        finally
        {
            this.highQueue.clear();
            this.normalQueue.clear();
            this.lowQueue.clear();
        }
    }

    public run(action: Delegate, priority: "high" | "normal" | "low" = "normal"): void
    {
        switch (priority)
        {
            case "high":
                this.highQueue.enqueue(action);
                break;
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