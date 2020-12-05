import { Indexer, hasValue, privatesFrom } from "@surface/core";
import { FieldInfo, MethodInfo, Type }     from "@surface/reflection";
import Metadata                            from "./metadata";
import Observer                            from "./observer";

const ARRAY_METHODS = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"] as const;

export default class Reactive
{
    protected static observe(root: Object, path: string[], observer: Observer): void
    {
        if (root instanceof Object)
        {
            const [key, ...keys] = path;

            const metadata = Metadata.from(root);

            let subject = metadata.subjects.get(key);

            if (!subject)
            {
                if (Array.isArray(root) && !metadata.isReactiveArray)
                {
                    this.observeArray(root);
                }

                const computed = metadata.computed.get(key);

                if (computed)
                {
                    for (const dependencies of computed)
                    {
                        this.observe(root, dependencies, observer);
                    }
                }
                else
                {
                    this.observeProperty(root, key);
                }

                metadata.subjects.set(key, subject = new Map());
            }

            subject.set(observer, keys);

            const property = (root as Indexer)[key];

            if (keys.length > 0 && hasValue(property))
            {
                this.observe(property, keys, observer);
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
                        hasValue(oldValue) && this.unobserve(oldValue, path, observer);
                        hasValue(newValue) && this.observe(newValue, path, observer);
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

                            if (!Object.is(value, oldValue))
                            {
                                member.descriptor.set!.call(this, value);

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

                            if (!Object.is(value, oldValue))
                            {
                                privates[key as string] = value;

                                action(this, value, oldValue);
                            }
                        },
                    },
                );
            }
        }
    }

    protected static unobserve(root: Object, path: string[], observer: Observer): void
    {
        if (root instanceof Object)
        {
            const [key, ...keys] = path;

            Metadata.from(root).subjects.get(key)?.delete(observer);

            const property = (root as Indexer)[key];

            if (keys.length > 0 && hasValue(property))
            {
                this.unobserve(property, keys, observer);
            }
        }
    }

    public static from(root: object, path: string[]): Observer
    {
        const key = path.join("\u{fffff}");

        const metadata = Metadata.from(root);

        let observer = metadata.observers.get(key);

        if (!observer)
        {
            this.observe(root, path, observer = new Observer(root, path));

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
}