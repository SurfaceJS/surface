import type { Delegate, IDisposable, Subscription } from "@surface/core";
import Metadata                                     from "./metadata.js";

export default class ReactiveMetadata implements IDisposable
{
    public readonly injectionsSubscription: Subscription;
    public readonly listenersSubscription: Subscription;

    public disposed:   boolean = false;
    public injections: string[] = [];
    public listeners:  Record<string, Delegate> = { };

    public constructor(target: Node)
    {
        this.injectionsSubscription = Metadata.from(target).injections.subscribe(x => this.injections = Array.from(x.keys()));
        this.listenersSubscription  = Metadata.from(target).listeners.subscribe(x => this.listeners   = Object.fromEntries(x));
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.injectionsSubscription.unsubscribe();
            this.listenersSubscription.unsubscribe();

            this.disposed = true;
        }
    }
}