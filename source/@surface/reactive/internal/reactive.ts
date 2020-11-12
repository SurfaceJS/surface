import { Indexer, hasValue, overrideProperty } from "@surface/core";
import { FieldInfo, MethodInfo, Type }         from "@surface/reflection";
import IObserver                               from "./interfaces/observer";
import Metadata                                from "./metadata";
import Observer                                from "./observer";
import Mode                                    from "./types/mode";

const ARRAY_METHODS = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"] as const;

export default class Reactive
{
    protected readonly mode:     Mode;
    protected readonly observer: IObserver = new Observer();
    protected readonly path:     string[];
    protected readonly root:     object;

    public constructor(root: object, path: string[], mode: Mode)
    {
        this.root = root;
        this.path = path;
        this.mode = mode;

        this.observe(root, path);
    }

    public static observe(root: object, path: string[], mode: Mode = "strict"): IObserver
    {
        const key = path.join("\u{fffff}");

        const metadata = Metadata.from(root);

        let reactive = metadata.reactivePaths.get(key);

        if (!reactive)
        {
            metadata.reactivePaths.set(key, reactive = new Reactive(root, path, mode));
        }

        return reactive.observer;
    }

    protected getValue(root: object, path: string[]): unknown
    {
        if (root)
        {
            const [key, ...keys] = path;

            if (keys.length > 0)
            {
                return this.getValue((root as Indexer)[key] as object, keys);
            }

            return (root as Indexer)[key];
        }

        return undefined;
    }

    protected observeArray(source: unknown[]): void
    {
        for (const method of ARRAY_METHODS)
        {
            const fn = source[method] as Function;

            function proxy(this: unknown[], ...args: unknown[]): unknown
            {
                const metadata = Metadata.of(this)!;

                const length = this.length;

                const elements = fn.apply(this, args);

                if (this.length != length)
                {
                    metadata.trackings.get("length")?.forEach((_, x) => x.notify());
                }

                return elements;
            }

            Object.defineProperty(source, method, { configurable: true, enumerable: false, value: proxy });
        }

        Metadata.of(source)!.isReactiveArray = true;
    }

    protected observeProperty(root: object, key: string): void
    {
        if (this.mode == "loose" && !(key in root))
        {
            (root as Indexer)[key] = undefined;
        }

        const member = Type.from(root).getMember(key);

        if (!member)
        {
            throw new Error(`Property ${key} does not exists on type ${root.constructor.name}`);
        }
        else if (member.descriptor.configurable && (member instanceof FieldInfo && !member.readonly || member instanceof MethodInfo))
        {
            const action = (instance: object, newValue: unknown, oldValue: unknown): void =>
            {
                const tracking = Metadata.of(instance)!.trackings.get(key)!;

                for (const [reactive, path] of tracking)
                {
                    if (path.length > 0)
                    {
                        hasValue(oldValue) && reactive.unobserve(oldValue, path);
                        hasValue(newValue) && reactive.observe(newValue, path);
                    }

                    reactive.notify();
                }
            };

            overrideProperty(root, key, action, member.descriptor);
        }
    }

    public observe(root: Object, path: string[]): void
    {
        if (root instanceof Object)
        {
            const [key, ...keys] = path;

            const metadata = Metadata.from(root);

            let tracking = metadata.trackings.get(key);

            if (!tracking)
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
                        this.observe(root, dependencies);
                    }
                }
                else
                {
                    this.observeProperty(root, key);
                }

                metadata.trackings.set(key, tracking = new Map());
            }

            tracking.set(this, keys);

            const property = (root as Indexer)[key];

            if (keys.length > 0 && hasValue(property))
            {
                this.observe(property, keys);
            }
        }
    }

    public unobserve(root: Object, path: string[]): void
    {
        if (root instanceof Object)
        {
            const [key, ...keys] = path;

            Metadata.of(root)!.trackings.get(key)?.delete(this);

            const property = (root as Indexer)[key];

            if (keys.length > 0 && hasValue(property))
            {
                this.unobserve(property, keys);
            }
        }
    }

    public notify(): void
    {
        if (this.observer.size > 0)
        {
            const value = this.getValue(this.root, this.path);

            this.observer.notify(value);
        }
    }
}