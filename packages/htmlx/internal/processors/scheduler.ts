import { type CancellationToken, type Delegate, resolveError, runAsync } from "@surface/core";

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

    private currentExecution: Promise<void> = Promise.resolve();
    private running:   boolean              = false;

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
                catch (e)
                {
                    const error = resolveError(e);

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

        this.currentExecution = runAsync(async () => (await this.execute(), this.stop()));

        // An update triggered asynchronously (e.g. a DOM mutation) can start an execution that the
        // caller never awaits. Attach a handler so it is never an unhandled rejection; real errors
        // are still surfaced to callers through execution().
        void this.currentExecution.catch(() => undefined);
    }

    private stop(): void
    {
        this.running = false;

        if (this.errors.length > 0)
        {
            throw new AggregateError([...this.errors], "One or more errors occurred.");
        }
    }

    public enqueue<T>(task: () => T, priority: "high" | "normal" | "low"): Promise<T>;
    public enqueue<T>(task: () => T, priority: "high" | "normal" | "low", cancellationToken: CancellationToken): Promise<T | undefined>;
    // Not async on purpose: the returned promise is the very one carrying the no-op rejection
    // handler below; an async wrapper would create a second, unhandled promise.
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    public enqueue(task: Delegate, priority: "high" | "normal" | "low", cancellationToken?: CancellationToken): Promise<unknown>
    {
        if (!this.running)
        {
            this.start();
        }

        const queue = priority == "high" ? this.highPriorityQueue : priority == "low" ? this.lowPriorityQueue : this.normalPriorityQueue;

        const promise = new Promise((resolve, reject) => queue.enqueue([task, resolve, reject, cancellationToken]));

        // Directives enqueue fire-and-forget tasks and discard the returned promise. When such a
        // task throws the promise would become an unhandled rejection; attach a handler to avoid it,
        // since the error is already aggregated and re-surfaced through execution().
        void promise.catch(() => undefined);

        return promise;
    }

    public async execution(): Promise<void>
    {
        if (!this.running)
        {
            return;
        }

        return this.currentExecution;
    }
}
