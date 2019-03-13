import { Action1, Indexer } from "@surface/core";
import { typeGuard }        from "@surface/core/common/generic";
import Type                 from "@surface/reflection";
import FieldInfo            from "@surface/reflection/field-info";
import Observer             from "./internal/observer";

const OBSERVER  = Symbol("reactive:observer");
const UNTRACKEDS = Symbol("reactive:untracked");

type Observeable = Indexer & { [OBSERVER]?: Observer, [UNTRACKEDS]?: Map<string, Observer> };

export default class Reactive
{
    private static rebuildDependenceTree(target: Observeable, observer: Observer)
    {
        if (target[OBSERVER])
        {
            observer.merge(target[OBSERVER]!);
        }
        else
        {
            observer.update(target);

            target[OBSERVER]   = observer;
            target[UNTRACKEDS] = new Map();
        }

        for (const [key, dependency] of observer.dependencies)
        {
            Reactive.makeReactive(target, key);

            if (target[key])
            {
                Reactive.rebuildDependenceTree(target[key] as Observeable, dependency);
            }
        }
    }

    public static makeReactive<TTarget extends Indexer & Observeable, TKey extends keyof TTarget>(target: TTarget, key: TKey): void
    {
        const member = Type.from(target).getMember(key as string);

        if (member instanceof FieldInfo)
        {
            const privateKey = `_${key}` as TKey;

            target[privateKey] = target[key];

            Object.defineProperty
            (
                target,
                key,
                {
                    get(this: TTarget)
                    {
                        return this[privateKey];
                    },
                    set(this: TTarget, value: TTarget[TKey])
                    {
                        const observer   = this[OBSERVER]!;
                        const untrackeds = this[UNTRACKEDS]!;
                        const oldValue   = this[privateKey];

                        if (!Object.is(oldValue, value))
                        {
                            this[privateKey] = value;

                            if (typeGuard<unknown, Observeable>(value, x => x instanceof Object))
                            {
                                if (value[OBSERVER])
                                {
                                    if (oldValue != null && untrackeds.has(key as string))
                                    {
                                        const untracked = untrackeds.get(key as string)!;

                                        const dependency = observer.dependencies.get(key as string)!;

                                        dependency.exclude(untracked);

                                        value[OBSERVER] = untracked;
                                    }

                                    const dependency = observer.dependencies.get(key as string)!;

                                    dependency.merge(value[OBSERVER]!);

                                    untrackeds.set(key as string, value[OBSERVER]!);

                                    value[OBSERVER] = dependency;
                                }
                                else
                                {
                                    const dependency = observer.dependencies.get(key as string)!;

                                    Reactive.rebuildDependenceTree(value, dependency);
                                }
                            }

                            observer.notify();
                        }
                    }
                }
            );
        }
    }

    public static observePath(target: Indexer & Observeable, path: string, listener: Action1<unknown>): Observer
    {
        const [key, ...keys] = path.split(".");

        if (keys.length > 0)
        {
            const observer = new Observer(target, key);

            Reactive.makeReactive(target, key);

            const dependency = Reactive.observePath(target[key] as Indexer, keys.join("."), listener);

            observer.dependencies.set(key, dependency);

            target[OBSERVER]   = observer as unknown as Observer;
            target[UNTRACKEDS] = new Map();

            return observer;
        }
        else
        {
            return Reactive.observeProperty(target, key, listener);
        }
    }

    public static observeProperty<TTarget extends Indexer & Observeable, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: Action1<TTarget[TKey]>): Observer<TTarget, TKey>
    {
        const observer = new Observer(target, key);

        Reactive.makeReactive(target, key);

        observer.subscribe(listener);
        observer.notify();

        target[OBSERVER]   = observer as unknown as Observer;
        target[UNTRACKEDS] = new Map();

        return observer;
    }
}