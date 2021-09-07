import type { Delegate, Subscription }                                                  from "@surface/core";
import { getPropertyDescriptor, getValue, isReadonly, resolveError }                    from "@surface/core";
import { buildStackTrace, throwTemplateEvaluationError, throwTemplateObservationError } from "../common.js";
import TemplateProcessError                                                             from "../errors/template-process-error.js";
import type { StackTrace }                                                              from "../types/index.js";
import bind                                                                             from "./bind.js";
import observe                                                                          from "./observe.js";
import type DestructuredEvaluator                                                       from "./types/destructured-evaluator.js";
import type Evaluator                                                                   from "./types/evaluator.js";
import type ObservablePath                                                              from "./types/observable-path";

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