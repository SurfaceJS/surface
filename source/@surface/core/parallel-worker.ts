import { Action, Action1, Nullable } from ".";

declare function setTimeout(handler: () => void, timeout?: number): number;
type Queue = [number, Action, Nullable<Action1<unknown>>];

export default class ParallelWorker
{
    private static id:      number        = 0;
    private static queue:   Array<Queue>  = [];
    private static running: boolean       = false;
    private static pending: boolean       = false;

    private static run(): void
    {
        if (ParallelWorker.queue.length > 0)
        {
            const queue = ParallelWorker.queue.splice(0);

            queue.forEach(([, action, callback]) => callback ? callback(action()) : action());

            if (ParallelWorker.pending)
            {
                ParallelWorker.run();
            }
            else
            {
                ParallelWorker.id      = 0;
                ParallelWorker.running = false;
            }
        }
        else
        {
            ParallelWorker.id      = 0;
            ParallelWorker.running = false;
            ParallelWorker.pending = false;
        }
    }

    public static enqueue(action: () => void): void;
    public static enqueue<TAction extends () => unknown>(action: TAction, callback?: (value: ReturnType<TAction>) => void): void;
    public static enqueue(action: Action, callback?: Action1<unknown>): void
    {
        ParallelWorker.queue.push([++ParallelWorker.id, action, callback]);

        if (!ParallelWorker.running)
        {
            ParallelWorker.running = true;
            setTimeout(() => ParallelWorker.run(), 0);
        }
        else
        {
            ParallelWorker.pending = true;
        }
    }
}