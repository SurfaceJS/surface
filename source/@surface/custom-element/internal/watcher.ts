import { Indexer, getValue } from "@surface/core";
import IObserver             from "./interfaces/observer";
import Observer              from "./observer";

export default class Watcher
{
    private readonly root: object;
    private readonly path: string[];

    private value?: unknown;

    public readonly observer: IObserver = new Observer();

    public constructor(root: object, path: string[])
    {
        this.root = root;
        this.path = path;
    }

    public detectChange(): void
    {
        const value = getValue(this.root as Indexer, this.path);

        if (!Object.is(value, this.value))
        {
            this.value = value;

            this.observer.notify(value);
        }
    }
}