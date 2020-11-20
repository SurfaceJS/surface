import { Queue }              from "@surface/collection";
import { CancellationToken, Delegate, runAsync } from "@surface/core";

export default class Scheduler
{
    private readonly highPriorityQueue:   Queue<[Delegate, CancellationToken?]> = new Queue();
    private readonly lowPriorityQueue:    Queue<[Delegate, CancellationToken?]> = new Queue();
    private readonly normalPriorityQueue: Queue<[Delegate, CancellationToken?]> = new Queue();
    private readonly timeout:     number;

    private currentExecution: Promise<void> = Promise.resolve();
    private running:          boolean       = false;

    public constructor(timeout: number)
    {
        this.timeout = timeout;
    }

    private async nextFrame(): Promise<number>
    {
        return new Promise(resolve => window.requestAnimationFrame(resolve));
    }

    private async processQueue(queue: Queue<[Delegate, CancellationToken?]>, hasPriorityChange?: () => boolean): Promise<void>
    {
        let expended = 0;

        while (queue.length > 0)
        {
            const [task, cancellationToken] = queue.dequeue()!;

            const start = window.performance.now();

            if (!cancellationToken?.canceled)
            {
                task();
            }

            const end = window.performance.now();

            expended += end - start;

            if (expended > this.timeout)
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
            await this.processQueue(this.highPriorityQueue);
            await this.processQueue(this.normalPriorityQueue, () => this.highPriorityQueue.length > 0);
            await this.processQueue(this.lowPriorityQueue, () => this.highPriorityQueue.length > 0 || this.normalPriorityQueue.length > 0);
        }
        finally
        {
            this.highPriorityQueue.clear();
            this.normalPriorityQueue.clear();
            this.lowPriorityQueue.clear();
        }
    }

    public enqueue(task: Delegate, priority: "high" | "normal" | "low" = "normal", cancellationToken: CancellationToken | undefined = undefined): void
    {
        switch (priority)
        {
            case "high":
                this.highPriorityQueue.enqueue([task, cancellationToken]);
                break;
            case "low":
                this.lowPriorityQueue.enqueue([task, cancellationToken]);
                break;
            case "normal":
            default:
                this.normalPriorityQueue.enqueue([task, cancellationToken]);
                break;
        }

        if (!this.running)
        {
            this.running = true;

            this.currentExecution = runAsync(this.execute.bind(this)).finally(() => this.running = false);
        }
    }

    public async whenDone(): Promise<void>
    {
        return this.currentExecution;
    }
}