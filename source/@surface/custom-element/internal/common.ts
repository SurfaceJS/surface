import { assert, Indexer, Nullable }       from "@surface/core";
import { Evaluate, IExpression, IPattern } from "@surface/expression";
import { IListener, ISubscription }        from "@surface/reactive";
import DataBind                            from "./data-bind";
import TemplateEvaluationError             from "./errors/template-evaluation-error";
import TemplateObservationError            from "./errors/template-observation-error";
import TemplateParseError                  from "./errors/template-parse-error";
import { Observables, Scope, StackTrace }  from "./types";

const wrapper = { "Window": /* istanbul ignore next */ function () { return; } }["Window"] as object as typeof Window;

wrapper.prototype = window;
wrapper.prototype.constructor = wrapper;

const windowWrapper = wrapper.prototype;

function buildStackTrace(stackTrace: StackTrace): string
{
    return stackTrace.map((entry, i) => entry.map(value => "   ".repeat(i) + value).join("\n")).join("\n");
}

export function createScope(scope: Indexer): Indexer
{
    scope["$class"] = classMap;
    scope["$style"] = styleMap;

    const handler: ProxyHandler<Indexer> =
    {
        get: (target, key) => key in target ? target[key as string] : (windowWrapper as unknown as Indexer)[key as string],
        has: (target, key) => key in target || key in windowWrapper,
        getOwnPropertyDescriptor: (target, key) =>
            Object.getOwnPropertyDescriptor(target, key) ?? Object.getOwnPropertyDescriptor(windowWrapper, key)
    };

    return new Proxy(scope, handler);
}

export function classMap(classes: Record<string, boolean>): string
{
    return Object.entries(classes)
        .filter(x => x[1])
        .map(x => x[0])
        .join(" ");
}

export function scapeBrackets(value: string)
{
    return value.replace(/(?<!\\)\\{/g, "{").replace(/\\\\{/g, "\\");
}

export function styleMap(rules: Record<string, boolean>): string
{
    return Object.entries(rules)
        .map(([key, value]) => `${key}: ${value}` )
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

export function throwTemplateParseError(message: string, stackTrace: StackTrace): never
{
    throw new TemplateParseError(message, buildStackTrace(stackTrace));
}

export function tryEvaluateExpression(scope: Scope, expression: IExpression, rawExpression: string, stackTrace: StackTrace): unknown
{
    try
    {
        return expression.evaluate(scope);
    }
    catch (error)
    {
        assert(error instanceof Error);

        throwTemplateEvaluationError(`Evaluation error in ${rawExpression}: ${error.message}`, stackTrace);
    }
}

export function tryEvaluateExpressionByDescriptor(scope: Scope, descriptor: { expression: IExpression, rawExpression: string, stackTrace: StackTrace }): unknown
{
    return tryEvaluateExpression(scope, descriptor.expression, descriptor.rawExpression, descriptor.stackTrace);
}

export function tryEvaluatePattern(scope: Scope, pattern: IPattern, value: unknown, rawExpression: string, stackTrace: StackTrace): Indexer
{
    try
    {
        return Evaluate.pattern(scope, pattern, value);
    }
    catch (error)
    {
        assert(error instanceof Error);

        throwTemplateEvaluationError(`Evaluation error in ${rawExpression}: ${error.message}`, stackTrace);
    }
}

export function tryEvaluatePatternByDescriptor(scope: Scope, value: unknown, descriptor: { pattern: IPattern, rawExpression: string, stackTrace: StackTrace}): Indexer
{
    return tryEvaluatePattern(scope, descriptor.pattern, value, descriptor.rawExpression, descriptor.stackTrace);
}

export function tryObserve(scope: Scope, observables: Observables, listener: IListener, rawExpression: string, stackTrace: StackTrace, lazy?: boolean): ISubscription
{
    try
    {
        return DataBind.observe(scope, observables, listener, lazy);
    }
    catch (error)
    {
        assert(error instanceof Error);

        throwTemplateObservationError(`Observation error in ${rawExpression}: ${error.message}`, stackTrace);
    }
}

export function tryObserveByDescriptor(scope: Scope, descriptor: { observables: Observables, rawExpression: string, stackTrace: StackTrace }, listener: IListener, lazy?: boolean): ISubscription
{
    return tryObserve(scope, descriptor.observables, listener, descriptor.rawExpression, descriptor.stackTrace, lazy);
}

export function* enumerateRange(start: ChildNode, end: ChildNode): Iterable<ChildNode>
{
    let simbling: Nullable<ChildNode> = null;

    while ((simbling = start.nextSibling) && simbling != end)
    {
        yield simbling;
    }
}