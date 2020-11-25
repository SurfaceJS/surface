import { IDisposable } from "@surface/core";
import { METADATA }    from "../symbols";

export default class Metadata
{
    private disposed: boolean = false;

    public readonly disposables: IDisposable[] = [];

    public hasListener:         boolean = false;
    public reflectingAttribute: boolean = false;

    public static from(target: object & { [METADATA]?: Metadata }): Metadata
    {
        return target[METADATA] = target[METADATA] ?? new Metadata();
    }

    public static of(target: object & { [METADATA]?: Metadata }): Metadata | undefined
    {
        return target[METADATA];
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.disposed = true;

            this.disposables.slice(0).forEach(x => x.dispose());
        }
    }
}