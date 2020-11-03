import { Queue }               from "@surface/collection";
import { Delegate, fireAsync } from "@surface/core";

export default class ParallelWorker
{
    public static readonly default = new ParallelWorker();

    private readonly queue:     Queue<Delegate> = new Queue();
    private readonly postQueue: Queue<Delegate> = new Queue();

    private readonly interval: number;

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

    public static run(action: Delegate, stage: "normal" | "after" = "normal"): void
    {
        ParallelWorker.default.run(action, stage);
    }

    private execute(resolve: Delegate, reject: Delegate<[Error]>): void
    {
        try
        {
            let expended = 0;

            while (this.queue.length > 0)
            {
                const action = this.queue.dequeue()!;

                const start = window.performance.now();

                action();

                const end = window.performance.now();

                expended += end - start;

                if (expended > this.interval)
                {
                    window.requestAnimationFrame(() => this.execute(resolve, reject));

                    return;
                }
            }

            while (this.postQueue.length > 0)
            {
                const action = this.postQueue.dequeue()!;

                const start = window.performance.now();

                action();

                const end = window.performance.now();

                expended += end - start;

                if (expended > this.interval)
                {
                    window.requestAnimationFrame(() => this.execute(resolve, reject));

                    return;
                }
            }
        }
        catch (error)
        {
            this.queue.clear();
            this.postQueue.clear();

            reject(error);

            return;
        }

        if (this.queue.length > 0)
        {
            this.execute(resolve, reject);
        }
        else
        {
            resolve();
        }
    }

    public async whenDone(): Promise<void>
    {
        return this.currentExecution;
    }

    public run(action: Delegate, stage: "normal" | "after" = "normal"): void
    {
        switch (stage)
        {
            case "after":
                this.postQueue.enqueue(action);
                break;
            case "normal":
            default:
                this.queue.enqueue(action);
                break;
        }

        if (!this.running)
        {
            this.running = true;

            this.currentExecution = new Promise<void>((resolve, reject) => void fireAsync(() => this.execute(resolve, reject)).finally(() => this.running = false));
        }
    }
}