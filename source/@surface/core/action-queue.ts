import { ArgumentsOf, ReturnOf } from ".";

export default class ActionQueue<T extends (...args: ArgumentsOf<T>) => unknown = () => unknown>
{
    private readonly actions: Array<T> = [];

    public add(action: T): void
    {
        this.actions.push(action);
    }

    public execute(...args: ArgumentsOf<T>): Array<ReturnOf<T>>
    {
        const values = [] as Array<ReturnOf<T>>;

        while (this.actions.length > 0)
        {
            values.push(this.actions.pop()!.apply(undefined, args));
        }

        return values;
    }

    public async executeAsync(...args: ArgumentsOf<T>): Promise<Array<ReturnOf<T>>>
    {
        const values = [] as Array<ReturnOf<T>>;

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