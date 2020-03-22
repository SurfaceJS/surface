import Queue from "@surface/collection/queue";

type Action   = () => unknown;
type Callback = (value: unknown) => void;

export default class ParallelWorker
{
    public static readonly default = new ParallelWorker();

    private readonly queue: Queue<[Action, Callback]> = new Queue();

    private readonly interval: number;

    private expended: number  = 0;
    private lastRun:  number  = 0;
    private running:  boolean = false;

    public constructor(interval?: number)
    {
        this.interval = interval ?? 33.33;
    }

    public static async run<TAction extends Action>(action: TAction): Promise<ReturnType<TAction>>
    {
        return await ParallelWorker.default.run(action);
    }

    private execute(): void
    {
        this.running = true;

        while (this.queue.length > 0)
        {
            const [action, callback] = this.queue.dequeue()!;

            const start = window.performance.now();

            callback(action());

            const end = window.performance.now();

            this.expended += (end - start);

            if (this.expended > this.interval)
            {
                this.expended = 0;

                window.requestAnimationFrame(() => this.execute());

                return;
            }
        }

        this.running = false;

        this.lastRun = window.performance.now();
    }

    public async run<TAction extends Action>(action: TAction): Promise<ReturnType<TAction>>
    {
        const promise = new Promise<ReturnType<TAction>>(resolve => this.queue.enqueue([action, resolve as Callback]));

        if (!this.running)
        {
            this.expended = window.performance.now() - this.lastRun;

            this.execute();
        }

        return await promise;
    }
}