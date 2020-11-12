import { getValue } from "@surface/core";
import IObserver    from "./interfaces/observer";
import Observer     from "./observer";

export default class Watcher
{
    private readonly root: object;
    private readonly path: string[];

    private value: unknown;

    public readonly observer: IObserver = new Observer();

    public constructor(root: object, path: string[])
    {
        this.root  = root;
        this.path  = path;
        this.value = getValue(root, ...path);
    }

    public detectChange(): void
    {
        if (this.observer.size > 0)
        {
            const value = getValue(this.root, ...this.path);

            if (!Object.is(value, this.value))
            {
                this.value = value;

                this.observer.notify(value);
            }
        }
    }
}