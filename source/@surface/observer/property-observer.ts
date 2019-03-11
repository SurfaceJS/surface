import { Action1, Func, Indexer, Nullable } from "@surface/core";
import Type                                 from "@surface/reflection";
import FieldInfo                            from "@surface/reflection/field-info";
import MethodInfo                           from "@surface/reflection/method-info";
import PropertyInfo                         from "@surface/reflection/property-info";

export class Observer<TValue = unknown>
{
    private readonly _listeners: Array<Action1<TValue>> = [];

    public get listeners(): Array<Action1<TValue>>
    {
        return this._listeners;
    }

    public clear(): Observer<TValue>
    {
        this._listeners.splice(0, this._listeners.length);
        return this;
    }

    public notify(value: TValue): Observer<TValue>
    {
        this._listeners.forEach(listener => listener(value));
        return this;
    }

    public subscribe(...actions: Array<Action1<TValue>>): Observer<TValue>
    {
        for (const action of actions)
        {
            if (!this._listeners.includes(action))
            {
                this._listeners.push(action);
            }
        }

        return this;
    }

    public unsubscribe(...actions: Array<Action1<TValue>>): Observer<TValue>
    {
        for (const action of actions)
        {
            const index = this._listeners.indexOf(action);

            if (index > -1)
            {
                this._listeners.splice(this._listeners.indexOf(action), 1);
            }
            else
            {
                throw new Error("Action not subscribed");
            }
        }

        return this;
    }
}

export default class PropertyObserver<TTarget, TTKey extends keyof TTarget> extends Observer<TTarget[TTKey]>
{
    private readonly key:    TTKey;
    private readonly target: TTarget;

    public constructor(target: TTarget, key: TTKey)
    {
        super();

        this.target = target;
        this.key    = key;
    }

    public notify(): Observer<TTarget[TTKey]>
    {
        super.notify(this.target[this.key]);
        return this;
    }
}

export const METADATA = Symbol("observer:metadata");

export type Subscription = { key: string|symbol, action: Action1<unknown> };

type Metadata =
{
    dependencies:  Map<string|symbol, Metadata>;
    observers:     Map<string|symbol, Observer>;
    subscriptions: Map<Indexer, Array<Subscription>>;
};

export type Observable = Indexer &
{
    [METADATA]?: Metadata;
};

type ObservedKey = keyof Observable;

export class Injector
{
    private static createMetadata(): Metadata
    {
        return { dependencies: new Map(), observers: new Map(), subscriptions: new Map() };
    }

    private static inject(target: Observable, key: string|symbol): void
    {
        const member = Type.from(target).getMember(key);

        if (member instanceof PropertyInfo)
        {
            if (!member.readonly)
            {
                Object.defineProperty
                (
                    target,
                    member.key,
                    {
                        get: member.getter as Func<unknown>|undefined,
                        set(this: Observable, value: unknown)
                        {
                            const metadata = this[METADATA]!;

                            if (!member.getter || !Object.is(member.getter.call(this), value))
                            {
                                member.setter!.call(this, value);

                                const observer = metadata.observers.get(member.key);

                                if (observer)
                                {
                                    observer.notify(value);
                                }
                            }
                        }
                    }
                );
            }
            else if (`_${member.key.toString()}` in target)
            {
                const privateKey = `__${member.key.toString()}__` as ObservedKey;
                target[privateKey] = target[member.key as ObservedKey];

                Object.defineProperty
                (
                    target,
                    `_${member.key.toString()}`,
                    {
                        get(this: Observable)
                        {
                            return this[privateKey];
                        },
                        set(this: Observable, value: unknown)
                        {
                            const metadata = this[METADATA]!;


                            if (!Object.is(value, this[privateKey]))
                            {
                                this[privateKey] = value;

                                const observer = metadata.observers.get(member.key);

                                if (observer)
                                {
                                    observer.notify(value);
                                }
                            }
                        }
                    }
                );
            }
        }
        else if (member instanceof FieldInfo)
        {
            const privateKey = typeof member.key == "symbol" ?
                Symbol(`_${member.key.toString()}`) as ObservedKey
                : `_${member.key.toString()}` as ObservedKey;

            target[privateKey] = member.value;

            Object.defineProperty
            (
                target,
                member.key,
                {
                    get(this: Observable)
                    {
                        return this[privateKey];
                    },
                    set(this: Observable, value: unknown)
                    {
                        const metadata = this[METADATA]!;

                        if (!Object.is(value, this[privateKey]))
                        {
                            if (value instanceof Object && metadata.dependencies.has(member.key) && !Injector.isObserved(value))
                            {
                                Injector.rebuild(value, metadata.dependencies.get(member.key)!);
                            }

                            this[privateKey] = value;

                            const observer = metadata.observers.get(member.key);

                            if (observer)
                            {
                                observer.notify(value);
                            }
                        }
                    }
                }
            );
        }
        else if (member instanceof MethodInfo)
        {
            target[member.key as ObservedKey] = function(...args: Array<unknown>)
            {
                const observer = this[METADATA]!.observers.get(member.key);

                if (observer)
                {
                    observer.notify(member.invoke.call(target, args));
                }
            };
        }
    }

    private static isObserved(target: unknown): boolean;
    private static isObserved(target: Observable): boolean;
    private static isObserved(target: Observable): boolean
    {
        return !!target[METADATA];
    }

    private static set(source: unknown, target: unknown): void;
    private static set(source: Nullable<Observable>, target: Nullable<Observable>): void;
    private static set(source: Nullable<Observable>, target: Nullable<Observable>): void
    {
        if (source && target)
        {
            const sourceMetadata = source[METADATA] = source[METADATA] || Injector.createMetadata();
            const targetMetadata = target[METADATA] = target[METADATA] || Injector.createMetadata();

            for (const [observedKey, sourceObserver] of sourceMetadata.observers.entries() as IterableIterator<[ObservedKey, Observer]>)
            {
                if (Injector.isObserved(source[observedKey]))
                {
                    Injector.set(source[observedKey], target[observedKey]);
                }

                for (const [key, listeners] of sourceMetadata.subscriptions)
                {
                    if (targetMetadata.subscriptions.has(key))
                    {
                        targetMetadata.subscriptions.get(key)!.push(...listeners);
                    }
                    else
                    {
                        targetMetadata.subscriptions.set(key, listeners);
                    }
                }

                if (targetMetadata.observers.has(observedKey as string|symbol))
                {
                    targetMetadata.observers.get(observedKey as string|symbol)!.subscribe(...sourceObserver.listeners);
                }
                else
                {
                    const observer = Injector
                        .observe(target, observedKey)
                        .subscribe(...sourceObserver.listeners)
                        .notify(target[observedKey]);

                    targetMetadata.observers.set(observedKey as string|symbol, observer);
                }

                sourceObserver.clear();
            }
        }
    }

    private static rebuild(target: Observable, metadata: Metadata): void
    {
        for (const [key, dependency] of metadata.dependencies)
        {
            Injector.inject(target, key);
            Injector.rebuild(target[key as ObservedKey] as Indexer, dependency);
        }

        target[METADATA] = metadata;
        metadata.observers.forEach((observer, key) => observer.notify(target[key as ObservedKey]));
    }

    public static observe<T extends Observable>(target: T, key: keyof T|symbol): Observer;
    public static observe<T extends Observable>(target: T, path: string): Observer;
    public static observe(target: Observable, path: string|symbol): Observer
    {
        const metadata = target[METADATA] = target[METADATA] || Injector.createMetadata();

        const [key, ...keys] = typeof path == "string" ? path.split(".") : [path];

        if (!metadata.observers.has(key))
        {
            const observer = new Observer();

            metadata.observers.set(key, observer);

            Injector.inject(target, key);
        }

        if (keys.length > 0)
        {
            const child = target[key as ObservedKey] as Observable;
            const observer = Injector.observe(child, keys.join("."));

            const dependency = child[METADATA]!;

            metadata.dependencies.set(key, dependency);

            return observer;
        }

        return metadata.observers.get(key)!;
    }
}