type Action   = () => unknown;
type Callback = (value: unknown) => void;

export default class ParallelWorker
{
    public static readonly default = new ParallelWorker(16.17);

    private readonly stack: Array<[Action, Callback]> = [];

    private readonly interval: number;

    private expended: number  = 0;
    private started:  number  = 0;
    private stopped:  number  = 0;
    private running:  boolean = false;

    public constructor(interval?: number)
    {
        this.interval = interval ?? 0;
    }

    public static async run<TAction extends Action>(action: TAction): Promise<ReturnType<TAction>>
    {
        return await ParallelWorker.default.run(action);
    }

    private execute(): void
    {
        this.running = true;

        while (this.stack.length > 0)
        {
            const [action, callback] = this.stack.shift()!;

            const start = performance.now();

            callback(action());

            const end = performance.now();

            this.expended += (end - start);

            if (this.expended > this.interval)
            {
                this.expended = 0;

                window.requestAnimationFrame(() => this.execute());

                return;
            }
        }

        this.running = false;

        this.stopped = performance.now();
    }

    public async run<TAction extends Action>(action: TAction): Promise<ReturnType<TAction>>
    {
        const promise = new Promise<ReturnType<TAction>>(resolve => this.stack.push([action, resolve as Callback]));

        if (!this.running)
        {
            this.expended = this.stopped - this.started;

            this.started = performance.now();

            this.execute();
        }

        return await promise;
    }
}