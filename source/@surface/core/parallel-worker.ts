import { Action1, Func } from ".";

declare function setTimeout(action: () => void, timeout: number): number;

class Task
{
    private readonly action:   Func<unknown>;
    private readonly callback: Action1<unknown>;

    public readonly id:       number;
    public readonly priority: number;

    public constructor(id: number, priority: number, action: Func<unknown>, callback: Action1<unknown>)
    {
        this.id       = id;
        this.priority = priority;
        this.action   = action;
        this.callback = callback;
    }

    public run(): void
    {
        this.callback(this.action());
    }
}

function sorter(left: Task, right: Task): number
{
    if (left.priority < right.priority)
    {
        return 1;
    }
    else if (left.priority > right.priority)
    {
        return -1;
    }
    else
    {
        if (left.id < right.id)
        {
            return -1;
        }
        else if (left.id > right.id)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    }
}

export default class ParallelWorker
{
    public static readonly default = new ParallelWorker(2);

    private readonly stack: Array<Task> = [];

    private readonly interval: number;

    private running: boolean = false;

    private id = 0;

    public constructor(interval?: number)
    {
        this.interval = interval || 0;
    }

    private async execute(): Promise<void>
    {
        this.running = true;

        while (this.stack.length > 0)
        {
            let timestamp = Date.now();

            const task = this.stack.sort(sorter).shift()!;

            task.run();

            if (Date.now() - timestamp > this.interval)
            {
                await this.release();

                timestamp = Date.now();
            }

            /*
            let timestamp = Date.now();

            const stack = this.stack.splice(0).sort(sorter);

            for (const task of stack)
            {
                task.run();

                if (Date.now() - timestamp > this.interval)
                {
                    await this.release();

                    timestamp = Date.now();
                }
            }
            */
        }

        this.id      = 0;
        this.running = false;
    }

    private async release(): Promise<void>
    {
        return await new Promise(resolve => setTimeout(resolve, 0));
    }

    private async executeAsync(): Promise<void>
    {
        return await new Promise(resolve => setTimeout(() => this.execute().then(resolve), 0));
    }

    public async run<TAction extends () => unknown>(action: TAction, priority?: number): Promise<ReturnType<TAction>>
    {
        const promise = new Promise<ReturnType<TAction>>(resolve => this.stack.push(new Task(++this.id, priority || 0, action, resolve as Action1<unknown>)));

        if (!this.running)
        {
            this.executeAsync();
        }

        return promise;
    }
}