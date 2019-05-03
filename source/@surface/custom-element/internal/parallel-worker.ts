type Action   = () => unknown;
type Callback = (value: unknown) => void;


export default class ParallelWorker
{
    public static readonly default = new ParallelWorker(16.17);

    private readonly stack: Array<[Action, Callback]> = [];

    private readonly interval: number;

    private running: boolean = false;

    public constructor(interval?: number)
    {
        this.interval = interval || 0;
    }

    private execute(): void
    {
        this.running = true;

        while (this.stack.length > 0)
        {
            const [action, callback] = this.stack.pop()!;

            const start = performance.now();

            callback(action());

            const end = performance.now();

            if (end - start > this.interval)
            {
                window.requestAnimationFrame(this.execute.bind(this));
            }
        }

        this.running = false;
    }

    public async run<TAction extends Action>(action: TAction): Promise<ReturnType<TAction>>
    {
        const promise = new Promise<ReturnType<TAction>>(resolve => this.stack.push([action, resolve as Callback]));

        if (!this.running)
        {
            this.execute();
        }

        return promise;
    }
}