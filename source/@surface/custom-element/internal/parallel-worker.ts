import { Queue }   from "@surface/collection";
import { Action1 } from "@surface/core";

type Action   = () => unknown;
type Callback = (value: unknown) => void;

export default class ParallelWorker
{
    public static readonly default = new ParallelWorker();

    private readonly queue: Queue<[Action, Callback]> = new Queue();

    private readonly interval: number;

    private _done:    Promise<void>           = Promise.resolve();
    private expended: number                  = 0;
    private resolve:  Action | null           = null;
    private reject:   Action1<unknown> | null = null;
    private running:  boolean                 = false;

    public constructor(interval: number = 16.17)
    {
        this.interval = interval;
    }

    public static async done(): Promise<void>
    {
        return ParallelWorker.default.done();
    }

    public static async run<TAction extends Action>(action: TAction): Promise<ReturnType<TAction>>
    {
        return ParallelWorker.default.run(action);
    }

    private execute(): void
    {
        let rejected = false;
        this.running = true;

        while (this.queue.length > 0)
        {
            const [action, callback] = this.queue.dequeue()!;

            const start = window.performance.now();

            try
            {
                callback(action());

                const end = window.performance.now();

                this.expended += end - start;

                if (this.expended > this.interval)
                {
                    this.expended = 0;

                    window.requestAnimationFrame(() => this.execute());

                    return;
                }
            }
            catch (error)
            {
                this.reject?.(error);
                this.reject = null;

                rejected = true;
            }
        }

        this.expended = 0;
        this.running  = false;

        if (!rejected)
        {
            this.resolve?.();
            this.resolve = null;
        }
    }

    public async done(): Promise<void>
    {
        return this._done;
    }

    public async run<TAction extends Action>(action: TAction): Promise<ReturnType<TAction>>
    {
        if (!this.running)
        {
            this._done = new Promise((resolve, reject) => (this.resolve = resolve, this.reject = reject));

            window.setTimeout(() => this.execute());
        }

        return await new Promise(resolve => this.queue.enqueue([action, resolve as Callback]));
    }
}