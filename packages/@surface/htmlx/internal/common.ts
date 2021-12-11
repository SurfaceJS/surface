import type { Delegate, IDisposable, Subscription }                            from "@surface/core";
import { getPropertyDescriptor, getValue, isReadonly, resolveError, setValue } from "@surface/core";
import type { ObservablePath, StackTrace }                                     from "@surface/htmlx-parser";
import TemplateEvaluationError                                                 from "./errors/template-evaluation-error.js";
import TemplateObservationError                                                from "./errors/template-observation-error.js";
import TemplateProcessError                                                    from "./errors/template-process-error.js";
import Metadata                                                                from "./metadata.js";
import AsyncObserver                                                           from "./reactivity/async-observer.js";
import { scheduler }                                                           from "./singletons.js";
import type DestructuredEvaluator                                              from "./types/destructured-evaluator.js";
import type Evaluator                                                          from "./types/evaluator.js";

export function onewaybind(element: HTMLElement, scope: object, key: string, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): IDisposable
{
    let listener: Delegate;

    if (key == "class" || key == "style")
    {
        listener = key == "class"
            ? () => element.setAttribute(key, classMap(tryEvaluate(scope, evaluator, source, stackTrace) as Record<string, boolean>))
            : () => element.setAttribute(key, styleMap(tryEvaluate(scope, evaluator, source, stackTrace) as Record<string, boolean>));
    }
    else
    {
        checkProperty(element, key, source, stackTrace);

        listener = () => void ((element as unknown as Record<string, unknown>)[key] = tryEvaluate(scope, evaluator, source, stackTrace));
    }

    const subscription = tryObserve(scope, observables, listener, true, source, stackTrace);

    listener();

    Metadata.from(element).context.binds.oneway.set(key, { evaluator, key, observables, scope });

    return { dispose: () => (subscription.unsubscribe(), Metadata.from(element).context.binds.oneway.delete(key)) };
}

export function twowaybind(element: HTMLElement, scope: object, left: string, right: ObservablePath, source?: string, stackTrace?: StackTrace): IDisposable
{
    checkPath(scope, right, source, stackTrace);
    checkProperty(element, left, source, stackTrace);

    const subscription = bind(element, [left], scope, right);

    Metadata.from(element).context.binds.twoway.set(left, { left, right, scope });

    return { dispose: () => (subscription.unsubscribe(), Metadata.from(element).context.binds.twoway.delete(left)) };
}

export default function eventListener(element: HTMLElement, scope: object, type: string, listenerEvaluator: Evaluator, contextEvaluator: Evaluator, source?: string, stackTrace?: StackTrace): IDisposable
{
    const context  = tryEvaluate(scope, contextEvaluator, source, stackTrace) as object | undefined;
    const listener = (tryEvaluate(scope, listenerEvaluator, source, stackTrace) as () => void).bind(context ?? element);

    element.addEventListener(type, listener);

    const metadata = Metadata.from(element);

    metadata.listeners.set(type, listener);
    metadata.context.listeners.set(type, { contextEvaluator, listenerEvaluator, scope, type });

    return {
        dispose: () =>
        {
            element.removeEventListener(type, listener);
            const metadata = Metadata.from(element);

            metadata.listeners.delete(type);
            metadata.context.listeners.delete(type);
        },
    };
}

export function bind(left: object, leftPath: ObservablePath, right: object, rightPath: ObservablePath): Subscription
{
    const leftListener  = (value: unknown): void => setValue(value, right, ...rightPath);
    const rightListener = (value: unknown): void => setValue(value, left, ...leftPath);

    const leftSubscription  = observe(left, [leftPath], leftListener, true);
    const rightSubscription = observe(right, [rightPath], rightListener);

    return { unsubscribe: () => (leftSubscription.unsubscribe(), rightSubscription.unsubscribe()) };
}

export function buildStackTrace(stackTrace: StackTrace): string
{
    return stackTrace.map((entry, i) => entry.map(value => "   ".repeat(i) + value).join("\n")).join("\n");
}

export function checkPath(scope: object, path: ObservablePath, source?: string, stackTrace?: StackTrace): void
{
    const target = getValue(scope, ...path.slice(0, path.length - 1)) as object;
    const key    = path[path.length - 1];

    checkProperty(target, key, source, stackTrace);
}

export function checkProperty(target: object, key: string, source?: string, stackTrace?: StackTrace): void
{
    const descriptor = getPropertyDescriptor(target, key);

    if (!descriptor || isReadonly(descriptor))
    {
        const message = descriptor
            ? `Binding error in '${source}': Property "${key}" of ${target.constructor.name} is readonly`
            : `Binding error in '${source}': Property "${key}" does not exists on type ${target.constructor.name}`;

        if (source && stackTrace)
        {
            throw new TemplateProcessError(message, buildStackTrace(stackTrace));
        } /* c8 ignore next 3 */

        throw new Error(message);
    }
}

export function classMap(classes: Record<string, boolean>): string
{
    return Object.entries(classes)
        .filter(x => x[1])
        .map(x => x[0])
        .join(" ");
}

export function *enumerateRange(start: ChildNode, end: ChildNode): Iterable<ChildNode>
{
    let simbling: ChildNode | null = null;

    while ((simbling = start.nextSibling) && simbling != end)
    {
        yield simbling;
    }
}

export function observe(target: object, observables: ObservablePath[], listener: Delegate<[unknown]>, lazy: boolean = false): Subscription
{
    const subscriptions: Subscription[] = [];

    for (const path of observables)
    {
        const observer = AsyncObserver.observe(target, path, scheduler);

        subscriptions.push(observer.subscribe(listener));

        if (!lazy)
        {
            listener(getValue(target, ...path));
        }
    }

    return { unsubscribe: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
}

export function styleMap(rules: Record<string, boolean>): string
{
    return Object.entries(rules)
        .map(([key, value]) => `${key}: ${value}`)
        .join("; ");
}

export function throwTemplateEvaluationError(message: string, stackTrace: StackTrace): never
{
    throw new TemplateEvaluationError(message, buildStackTrace(stackTrace));
}

export function throwTemplateObservationError(message: string, stackTrace: StackTrace): never
{
    throw new TemplateObservationError(message, buildStackTrace(stackTrace));
}

export function tryEvaluate(scope: object, evaluator: Evaluator, source?: string, stackTrace?: StackTrace): unknown
{
    try
    {
        return evaluator(scope);
    }
    catch (error)
    {
        if (source && stackTrace)
        {
            throwTemplateEvaluationError(`Evaluation error in '${source}': ${resolveError(error).message}`, stackTrace);
        } /* c8 ignore next 3 */

        throw error;
    }
}

export function tryEvaluatePattern(scope: object, evaluator: DestructuredEvaluator, value: unknown, source?: string, stackTrace?: StackTrace): object
{
    try
    {
        return evaluator(scope, value);
    }
    catch (error)
    {
        if (source && stackTrace)
        {
            throwTemplateEvaluationError(`Evaluation error in '${source}': ${resolveError(error).message}`, stackTrace);
        } /* c8 ignore next 3 */

        throw error;
    }
}

export function tryObserve(target: object, observables: ObservablePath[], listener: Delegate<[unknown]>, lazy?: boolean, source?: string, stackTrace?: StackTrace): Subscription
{
    try
    {
        return observe(target, observables, listener, lazy);
    }
    catch (error)
    {
        if (source && stackTrace)
        {
            throwTemplateObservationError(`Binding error in '${source}': ${resolveError(error).message}`, stackTrace);
        } /* c8 ignore next 3 */

        throw error;
    }
}