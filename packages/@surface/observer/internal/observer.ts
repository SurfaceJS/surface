import type { Delegate, Indexer, Subscription } from "@surface/core";
import { getValue, hasValue, privatesFrom }     from "@surface/core";
import { FieldInfo, MethodInfo, Type }          from "@surface/reflection";
import Metadata                                 from "./metadata.js";

const ARRAY_METHODS = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"] as const;

export default class Observer<TValue = unknown>
{
    protected readonly path:      string[];
    protected readonly root:      object;
    protected readonly listeners: Set<Delegate<[TValue]>> = new Set();

    public constructor(root: object, path: string[])
    {
        this.root = root;
        this.path = path;
    }

    protected static makeComputed(root: object, key: string, dependencies: string[][]): void
    {
        Metadata.from(root).computed.set(key, dependencies);
    }

    protected static observePath(root: Object, path: string[], observer: Observer): void
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
                this.observePath(property, keys, observer);
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
                this.observePath(root, dependency, observer);
            }
        }
    }

    protected static observeProperty(root: object, key: string): void
    {
        const member = Type.from(root).getMember(key);

        if (!member)
        {
            throw new Error(`Property "${key}" does not exists on type ${root.constructor.name}`);
        }
        else if (member.descriptor.configurable && (member instanceof FieldInfo && !member.readonly || member instanceof MethodInfo))
        {
            const action = (instance: object, newValue: unknown, oldValue: unknown): void =>
            {
                const observers = Metadata.from(instance).subjects.get(key)!;

                for (const [observer, path] of observers)
                {
                    if (path.length > 0)
                    {
                        hasValue(oldValue) && this.unobservePath(oldValue, path, observer);
                        hasValue(newValue) && this.observePath(newValue, path, observer);
                    }

                    observer.notify();
                }
            };

            if (member.descriptor?.set)
            {
                Reflect.defineProperty
                (
                    root,
                    key,
                    {
                        configurable: member.descriptor.configurable,
                        enumerable:   member.descriptor.enumerable,
                        get:          member.descriptor.get,
                        set(this: object, value: unknown)
                        {
                            const oldValue = member.descriptor.get?.call(this);

                            member.descriptor.set!.call(this, value);

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

    protected static unobservePath(root: Object, path: string[], observer: Observer): void
    {
        if (root instanceof Object)
        {
            const [key, ...keys] = path;

            Metadata.from(root).subjects.get(key)?.delete(observer);

            const property = (root as Indexer)[key];

            if (keys.length > 0 && hasValue(property))
            {
                this.unobservePath(property, keys, observer);
            }
        }
    }

    public static compute(root: object, key: string, dependencies: string[][]): Observer
    {
        this.makeComputed(root, key, dependencies);

        return this.observe(root, [key]);
    }

    public static observe(root: object, path: string[]): Observer
    {
        const key = path.join("\u{fffff}");

        const metadata = Metadata.from(root);

        let observer = metadata.observers.get(key);

        if (!observer)
        {
            this.observePath(root, path, observer = new Observer(root, path));

            metadata.observers.set(key, observer);
            metadata.disposables.push({ dispose: () => this.unobservePath(root, path, observer!) });
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

    public subscribe(listerner: Delegate<[TValue]>): Subscription
    {
        this.listeners.add(listerner);

        return { unsubscribe: () => this.unsubscribe(listerner) };
    }

    public unsubscribe(listerner: Delegate<[TValue]>): void
    {
        if (!this.listeners.delete(listerner))
        {
            throw new Error("Listerner not subscribed");
        }
    }

    public notify(): void
    {
        if (this.listeners.size > 0)
        {
            const value = getValue(this.root, ...this.path) as TValue;

            for (const listerner of this.listeners)
            {
                listerner(value);
            }
        }
    }
}