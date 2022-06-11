import type { Delegate, IDisposable, Indexer, Subscription }                   from "@surface/core";
import { getPropertyDescriptor, getValue, hasValue, isReadonly, privatesFrom } from "@surface/core";
import Metadata                                                                from "./metadata.js";

const ARRAY_METHODS = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"] as const;

export default class Observer<TValue = unknown> implements IDisposable
{
    protected readonly path:      [string, ...string[]];
    protected readonly root:      object;
    protected readonly listeners: Set<Delegate<[TValue]>> = new Set();

    public constructor(root: object, path: [string, ...string[]])
    {
        this.root = root;
        this.path = path;
    }

    protected static makeComputed(root: object, key: string, dependencies: string[][]): void
    {
        Metadata.from(root).computed.set(key, dependencies);
    }

    protected static observePath(root: Object, path: [string, ...string[]], observer: Observer): void
    {
        if (root instanceof Object)
        {
            const [key, ...keys] = path;

            const metadata = Metadata.from(root);

            this.observeComputed(root, key, metadata, observer);

            let subject = metadata.subjects.get(key);

            if (!subject)
            {
                if (Array.isArray(root) && !metadata.isReactiveArray)
                {
                    this.observeArray(root);
                }

                this.observeProperty(root, key);

                metadata.subjects.set(key, subject = new Map());
            }

            subject.set(observer, keys);

            const property = (root as Indexer)[key];

            if (keys.length > 0 && hasValue(property))
            {
                this.observePath(property, keys as [string, ...string[]], observer);
            }
        }
    }

    protected static observeArray(source: unknown[]): void
    {
        for (const method of ARRAY_METHODS)
        {
            const fn = source[method] as Function;

            function proxy(this: unknown[], ...args: unknown[]): unknown
            {
                const metadata = Metadata.from(this)!;

                const length = this.length;

                const elements = fn.apply(this, args);

                if (this.length != length)
                {
                    metadata.subjects.get("length")?.forEach((_, x) => x.notify());
                }

                return elements;
            }

            Object.defineProperty(source, method, { configurable: true, enumerable: false, value: proxy });
        }

        Metadata.from(source).isReactiveArray = true;
    }

    protected static observeComputed(root: Object, key: string, metadata: Metadata, observer: Observer): void
    {
        const computed = metadata.computed.get(key);

        if (computed)
        {
            for (const dependency of computed)
            {
                this.observePath(root, dependency as [string, ...string[]], observer);
            }
        }
    }

    protected static observeProperty(root: object, key: string): void
    {
        const descriptor = getPropertyDescriptor(root, key);

        if (!descriptor)
        {
            throw new Error(`Property "${key}" does not exists on type ${root.constructor.name}`);
        }
        else if (descriptor.configurable && !isReadonly(descriptor) || descriptor.value instanceof Function)
        {
            const action = (instance: object, newValue: unknown, oldValue: unknown): void =>
            {
                const observers = Metadata.from(instance).subjects.get(key)!;

                for (const [observer, path] of observers)
                {
                    if (path.length > 0)
                    {
                        hasValue(oldValue) && this.unobservePath(oldValue, path as [string, ...string[]], observer);
                        hasValue(newValue) && this.observePath(newValue, path as [string, ...string[]], observer);
                    }

                    observer.notify();
                }
            };

            if (descriptor?.set)
            {
                Reflect.defineProperty
                (
                    root,
                    key,
                    {
                        configurable: descriptor.configurable,
                        enumerable:   descriptor.enumerable,
                        get:          descriptor.get,
                        set(this: object, value: unknown)
                        {
                            const oldValue = descriptor.get?.call(this);

                            descriptor.set!.call(this, value);

                            if (!Object.is(value, oldValue))
                            {
                                action(this, value, oldValue);
                            }
                        },
                    },
                );
            }
            else
            {
                const privates = privatesFrom(root);

                privates[key] = (root as Indexer)[key];

                Reflect.defineProperty
                (
                    root,
                    key,
                    {
                        configurable: true,
                        enumerable:   true,
                        get()
                        {
                            return privates[key as string];
                        },
                        set(this: object, value: unknown)
                        {
                            const oldValue = privates[key as string];

                            privates[key as string] = value;

                            if (!Object.is(value, oldValue))
                            {
                                action(this, value, oldValue);
                            }
                        },
                    },
                );
            }
        }
    }

    protected static unobservePath(root: Object, path: [string, ...string[]], observer: Observer): void
    {
        if (root instanceof Object)
        {
            const [key, ...keys] = path;

            Metadata.from(root).subjects.get(key)?.delete(observer);

            const property = (root as Indexer)[key];

            if (keys.length > 0 && hasValue(property))
            {
                this.unobservePath(property, keys as [string, ...string[]], observer);
            }
        }
    }

    public static compute(target: object, key: string, dependencies: string[][]): Observer
    {
        this.makeComputed(target, key, dependencies);

        return this.observe(target, [key]);
    }

    public static observe(root: object, path: [string, ...string[]]): Observer
    {
        const key = path.join("\u{fffff}");

        const metadata = Metadata.from(root);

        let observer = metadata.observers.get(key);

        if (!observer)
        {
            this.observePath(root, path, observer = new Observer(root, path));

            metadata.observers.set(key, observer);
        }

        return observer;
    }

    public static notify(root: object, path?: string[]): void
    {
        const metadata = Metadata.from(root);

        path
            ? metadata.observers.get(path.join("\u{fffff}"))?.notify()
            : metadata.observers.forEach(x => x.notify());
    }

    public static notifyAll(target: object, key: string): void
    {
        const observers = Metadata.from(target).subjects.get(key)?.keys();

        if (observers)
        {
            for (const observer of observers)
            {
                observer.notify();
            }
        }
    }

    public dispose(): void
    {
        Observer.unobservePath(this.root, this.path, this as Observer);
    }

    public subscribe(listener: Delegate<[TValue]>): Subscription
    {
        this.listeners.add(listener);

        return { unsubscribe: () => this.unsubscribe(listener) };
    }

    public unsubscribe(listener: Delegate<[TValue]>): void
    {
        if (!this.listeners.delete(listener))
        {
            throw new Error("Listener not subscribed");
        }
    }

    public notify(): void
    {
        if (this.listeners.size > 0)
        {
            const value = getValue(this.root, ...this.path) as TValue;

            for (const listener of this.listeners)
            {
                listener(value);
            }
        }
    }
}
