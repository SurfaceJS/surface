import type { CancellationToken, Delegate } from "@surface/core";
import { AggregateError, runAsync }         from "@surface/core";

type Node<T> = { value: T, next?: Node<T> };

class Queue<T>
{
    private _length: number = 0;

    private node:     Node<T> | null = null;
    private lastNode: Node<T> | null = null;

    public get length(): number
    {
        return this._length;
    }

    public enqueue(value: T): void
    {
        const node = { value };

        if (this.node)
        {
            this.lastNode!.next = node;
        }
        else
        {
            this.node = node;
        }

        this.lastNode = node;

        this._length++;
    }

    public dequeue(): T | null
    {
        const value = this.node?.value;

        this.node = this.node?.next ?? null;

        this._length--;

        if (this._length == 0)
        {
            this.lastNode = null;
        }

        return value ?? null;
    }
}

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

        this.execution = runAsync(async () => (await this.execute(), this.stop()));
    }

    private stop(): void
    {
        this.running = false;

        if (this.errors.length > 0)
        {
            throw new AggregateError([...this.errors]);
        }
    }

    public async enqueue<T>(task: () => T, priority: "high" | "normal" | "low"): Promise<T>
    public async enqueue<T>(task: () => T, priority: "high" | "normal" | "low", cancellationToken: CancellationToken): Promise<T | undefined>
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