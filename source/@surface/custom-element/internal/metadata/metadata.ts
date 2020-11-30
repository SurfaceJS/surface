import { IDisposable } from "@surface/core";
import { METADATA }    from "../symbols";

export default class Metadata
{
    private disposed: boolean = false;

    public readonly disposables: Set<IDisposable> = new Set();

    public hasListener:         boolean = false;
    public reflectingAttribute: boolean = false;

    public host?: Node;

    public static from(target: object): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { value: new Metadata() });
        }

        return Reflect.get(target, METADATA);
    }

    public static of(target: object): Metadata | undefined
    {
        return Reflect.get(target, METADATA);
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.disposed = true;

            this.disposables.forEach(x => x.dispose());
            this.disposables.clear();
        }
    }
}