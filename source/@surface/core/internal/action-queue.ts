
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class ActionQueue<T extends (...args: any) => any = () => void>
{
    private readonly actions: T[] = [];

    public add(action: T): void
    {
        this.actions.push(action);
    }

    public execute(...args: Parameters<T>): ReturnType<T>[]
    {
        const values = [] as ReturnType<T>[];

        while (this.actions.length > 0)
        {
            values.push(this.actions.pop()!.bind(null)(args));
        }

        return values;
    }

    public async executeAsync(...args: Parameters<T>): Promise<ReturnType<T>[]>
    {
        const values = [] as ReturnType<T>[];

        while (this.actions.length > 0)
        {
            values.push(this.actions.pop()!.bind(null)(args));
        }

        return Promise.resolve(values);
    }

    public remove(action: T): void
    {
        this.actions.splice(this.actions.indexOf(action), 1);
    }
}