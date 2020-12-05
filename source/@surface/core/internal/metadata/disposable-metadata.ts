import IDisposable             from "../interfaces/disposable";
import { DISPOSABLE_METADATA } from "../symbols";

export default class DisposableMetadata implements IDisposable
{
    private readonly disposables: Set<IDisposable> = new Set();
    private disposed: boolean = false;

    public hooked: boolean = false;

    public static from(target: object): DisposableMetadata
    {
        if (!Reflect.has(target, DISPOSABLE_METADATA))
        {
            Reflect.defineProperty(target, DISPOSABLE_METADATA, { value: new DisposableMetadata() });
        }

        return Reflect.get(target, DISPOSABLE_METADATA) as DisposableMetadata;
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

    public add(disposable: IDisposable): void
    {
        this.disposables.add(disposable);
    }

    public remove(disposable: IDisposable): void
    {
        this.disposables.delete(disposable);
    }
}