
// tslint:disable-next-line:no-any
export default class ActionQueue<T extends (...args: any) => any = () => void>
{
    private readonly actions: Array<T> = [];

    public add(action: T): void
    {
        this.actions.push(action);
    }

    public execute(...args: Parameters<T>): Array<ReturnType<T>>
    {
        const values = [] as Array<ReturnType<T>>;

        while (this.actions.length > 0)
        {
            values.push(this.actions.pop()!.apply(undefined, args));
        }

        return values;
    }

    public async executeAsync(...args: Parameters<T>): Promise<Array<ReturnType<T>>>
    {
        const values = [] as Array<ReturnType<T>>;

        while (this.actions.length > 0)
        {
            values.push(this.actions.pop()!.apply(undefined, args));
        }

        return await Promise.resolve(values);
    }

    public remove(action: T): void
    {
        this.actions.splice(this.actions.indexOf(action), 1);
    }
}