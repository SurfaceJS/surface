import { Action1, Indexer, Nullable } from "@surface/core";

export default class Observer<TTarget extends Indexer = Indexer, TKey extends keyof TTarget = string>
{
    private readonly _dependencies: Map<string, Observer> = new Map();
    private readonly _key:          TKey;

    private readonly listeners:     Array<Action1<TTarget[TKey]>> = [];

    private target: Nullable<TTarget>;

    public get dependencies(): Map<keyof TTarget, Observer>
    {
        return this._dependencies;
    }

    public get key(): TKey
    {
        return this._key;
    }

    public constructor(target: TTarget, key: TKey)
    {
        this.target = target;
        this._key   = key;
    }

    public exclude(observer: Observer): void
    {
        for (const listener of observer.listeners)
        {
            this.unsubscribe(listener);
        }

        for (const [key, dependency] of observer.dependencies)
        {
            if (this.dependencies.has(key))
            {
                this.dependencies.get(key)!.exclude(dependency);
            }
            else
            {
                this.dependencies.delete(key);
            }
        }
    }

    public merge(observer: Observer): void
    {
        for (const listener of observer.listeners)
        {
            this.subscribe(listener);
        }

        for (const [key, dependency] of observer.dependencies)
        {
            if (this.dependencies.has(key))
            {
                this.dependencies.get(key)!.merge(dependency);
            }
            else
            {
                this.dependencies.set(key, dependency);
            }
        }
    }

    public subscribe(listerner: Action1<TTarget[TKey]>)
    {
        this.listeners.push(listerner);
    }

    public unsubscribe(listerner: Action1<TTarget[TKey]>)
    {
        const index = this.listeners.indexOf(listerner);

        if (index > -1)
        {
            this.listeners.splice(index, 1);
        }
        else
        {
            throw new Error("Action not subscribed");
        }
    }

    public update(target: Nullable<TTarget>): void
    {
        this.target = target;
    }

    public notify(): void
    {
        if (this.target)
        {
            for (const listerner of this.listeners)
            {
                listerner(this.target[this.key]);
            }

            for (const dependency of this.dependencies.values())
            {
                dependency.notify();
            }
        }
    }
}