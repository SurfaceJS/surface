import { runAsync }     from "./common/promises";
import AggregateError    from "./errors/aggregate-error";
import { Delegate }      from "./types";
import CancellationToken from "./types/cancellation-token";

type Entry =
{
    action:             Delegate,
    cancellationToken?: CancellationToken,
    reject:             Delegate<[Error]>,
    resolve:            Delegate<[unknown]>,
};

export default class ParallelWorker
{
    private readonly queue: Entry[] = [];

    private currentExecution: Promise<void> = Promise.resolve();
    private running:   boolean = false;

    private execute(): void
    {
        const errors: Error[] = [];

        while (this.queue.length > 0)
        {
            const { action, resolve, reject, cancellationToken } = this.queue.shift()!;
            try
            {
                if (!cancellationToken?.canceled)
                {
                    resolve(action());
                }
                else
                {
                    resolve(null);
                }
            }
            catch (error)
            {
                errors.push(error);

                reject(error);
            }
        }

        if (errors.length > 0)
        {
            throw new AggregateError(errors);
        }
    }

    public async done(): Promise<void>
    {
        return this.currentExecution;
    }

    public async run<TAction extends Delegate>(action: TAction, cancellationToken?: CancellationToken): Promise<ReturnType<TAction> | null>
    {
        if (!this.running)
        {
            this.running = true;

            this.currentExecution = runAsync(() => this.execute())
                .finally(() => this.running = false);
        }

        return new Promise((resolve: Delegate, reject: Delegate) => this.queue.push({ action, cancellationToken, reject, resolve }));
    }
}