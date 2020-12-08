import { Queue }                            from "@surface/collection";
import type { CancellationToken, Delegate } from "@surface/core";
import { AggregateError, runAsync }         from "@surface/core";

type Entry =
[
    task:               Delegate<[], unknown>,
    resolve:            Delegate<[unknown]>,
    reject:             Delegate<[Error]>,
    cancellationToken?: CancellationToken,
];

export default class Scheduler
{
    private readonly errors:              Error[]      = [];
    private readonly highPriorityQueue:   Queue<Entry> = new Queue();
    private readonly lowPriorityQueue:    Queue<Entry> = new Queue();
    private readonly normalPriorityQueue: Queue<Entry> = new Queue();
    private readonly timeout:             number;

    private execution: Promise<void> = Promise.resolve();
    private running:   boolean       = false;

    public constructor(timeout: number)
    {
        this.timeout = timeout;
    }

    private async nextFrame(): Promise<number>
    {
        return new Promise(resolve => window.requestAnimationFrame(resolve));
    }

    private async processQueue(queue: Queue<Entry>, hasPriorityChange?: () => boolean): Promise<void>
    {
        let expended = 0;

        while (queue.length > 0)
        {
            const [task, resolve, reject, cancellationToken] = queue.dequeue()!;

            const start = window.performance.now();

            if (cancellationToken?.canceled)
            {
                resolve(undefined);
            }
            else
            {
                try
                {
                    resolve(task());
                }
                catch (error)
                {
                    this.errors.push(error);

                    reject(error);
                }
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
        await this.processQueue(this.highPriorityQueue);
        await this.processQueue(this.normalPriorityQueue, () => this.highPriorityQueue.length > 0);
        await this.processQueue(this.lowPriorityQueue, () => this.highPriorityQueue.length > 0 || this.normalPriorityQueue.length > 0);
    }

    private start(): void
    {
        this.errors.length = 0;

        this.running = true;

        this.execution = runAsync(this.execute.bind(this)).then(this.stop.bind(this));
    }

    private stop(): void
    {
        this.running = false;

        if (this.errors.length > 0)
        {
            throw new AggregateError([...this.errors]);
        }
    }

    public async enqueue<T extends Delegate>(task: T, priority: "high" | "normal" | "low"): Promise<ReturnType<T>>
    public async enqueue<T extends Delegate>(task: T, priority: "high" | "normal" | "low", cancellationToken: CancellationToken): Promise<ReturnType<T> | undefined>
    public async enqueue(task: Delegate, priority: "high" | "normal" | "low", cancellationToken?: CancellationToken): Promise<unknown>
    {
        if (!this.running)
        {
            this.start();
        }

        switch (priority)
        {
            case "high":
                return new Promise((resolve, reject) => this.highPriorityQueue.enqueue([task, resolve, reject, cancellationToken]));
            case "low":
                return new Promise((resolve, reject) => this.lowPriorityQueue.enqueue([task, resolve, reject, cancellationToken]));
            default:
                return new Promise((resolve, reject) => this.normalPriorityQueue.enqueue([task, resolve, reject, cancellationToken]));
        }
    }

    public async whenDone(): Promise<void>
    {
        return this.execution;
    }
}