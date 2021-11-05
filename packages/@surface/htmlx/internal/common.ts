import type { Delegate, Subscription }                                         from "@surface/core";
import { getPropertyDescriptor, getValue, isReadonly, resolveError, setValue } from "@surface/core";
import type { ObservablePath, StackTrace }                                     from "@surface/htmlx-parser";
import TemplateEvaluationError                                                 from "./errors/template-evaluation-error.js";
import TemplateObservationError                                                from "./errors/template-observation-error.js";
import TemplateProcessError                                                    from "./errors/template-process-error.js";
import AsyncObserver                                                           from "./reactivity/async-observer.js";
import { scheduler }                                                           from "./singletons.js";
import type DestructuredEvaluator                                              from "./types/destructured-evaluator.js";
import type Evaluator                                                          from "./types/evaluator.js";

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

export function checkProperty(target: object, key: string, source: string | undefined, stackTrace: StackTrace | undefined): void
{
    const descriptor = getPropertyDescriptor(target, key);

    if (!descriptor || isReadonly(descriptor))
    {
        const message = descriptor
            ? `Binding error in '${source}': Property "${key}" of ${target.constructor.name} is readonly`
            : `Binding error in '${source}': Property "${key}" does not exists on type ${target.constructor.name}`;

        throw new TemplateProcessError(message, buildStackTrace(stackTrace ?? []));
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

export function stringToCSSStyleSheet(source: string): CSSStyleSheet
{
    const sheet = new CSSStyleSheet() as CSSStyleSheet & { replaceSync: (source: string) => void };

    sheet.replaceSync(source);
    sheet.toString = () => source;

    return sheet;
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

export function tryBind(left: object, leftPath: ObservablePath, right: object, rightPath: ObservablePath, source: string = "", stackTrace: StackTrace = []): Subscription
{
    try
    {
        return bind(left, leftPath, right, rightPath);
    }
    catch (error)
    {
        if (source && stackTrace)
        {
            throwTemplateObservationError(`Binding error in '${source}': ${resolveError(error).message}`, stackTrace);
        }

        throw error;
    }
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
        }

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
        }

        throw error;
    }
}

export function tryObserve(target: object, observables: ObservablePath[], listener: Delegate<[unknown]>, lazy: boolean = false, source: string = "", stackTrace: StackTrace = []): Subscription
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
        }

        throw error;
    }
}