import { assert, Indexer, Nullable }       from "@surface/core";
import { Evaluate, IExpression, IPattern } from "@surface/expression";
import { IListener, ISubscription }        from "@surface/reactive";
import DataBind                            from "./data-bind";
import TemplateEvaluationError             from "./errors/template-evaluation-error";
import TemplateObservationError            from "./errors/template-observation-error";
import TemplateParseError                  from "./errors/template-parse-error";
import IObservable                         from "./interfaces/observable";
import ITraceable                          from "./interfaces/traceable";
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
    const properties =
    {
        $class: { value: classMap, writable: false, enumerable: true },
        $style: { value: styleMap, writable: false, enumerable: true },
    };

    Object.defineProperties(scope, properties);

    const handler: ProxyHandler<Indexer> =
    {
        get: (target, key) => key in target ? target[key as string] : (windowWrapper as object as Indexer)[key as string],
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

export function tryEvaluateExpressionByDirective(scope: Scope, directive: { expression: IExpression } & ITraceable): unknown
{
    return tryEvaluateExpression(scope, directive.expression, directive.rawExpression, directive.stackTrace);
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

export function tryEvaluatePatternByDirective(scope: Scope, value: unknown, directive: { pattern: IPattern } & ITraceable): Indexer
{
    return tryEvaluatePattern(scope, directive.pattern, value, directive.rawExpression, directive.stackTrace);
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

export function tryObserveByDirective(scope: Scope, directive: IObservable & ITraceable, listener: IListener, lazy?: boolean): ISubscription
{
    return tryObserve(scope, directive.observables, listener, directive.rawExpression, directive.stackTrace, lazy);
}

export function* enumerateRange(start: ChildNode, end: ChildNode): Iterable<ChildNode>
{
    let simbling: Nullable<ChildNode> = null;

    while ((simbling = start.nextSibling) && simbling != end)
    {
        yield simbling;
    }
}