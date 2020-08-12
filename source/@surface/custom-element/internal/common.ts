import { Indexer, assert }                 from "@surface/core";
import { Evaluate, IExpression, IPattern } from "@surface/expression";
import { IListener, ISubscription }        from "@surface/reactive";
import DataBind                            from "./data-bind";
import TemplateEvaluationError             from "./errors/template-evaluation-error";
import TemplateObservationError            from "./errors/template-observation-error";
import TemplateParseError                  from "./errors/template-parse-error";
import IKeyValueObservable                 from "./interfaces/key-value-observable";
import IKeyValueTraceable                  from "./interfaces/key-value-traceable";
import IObservable                         from "./interfaces/observable";
import ITraceable                          from "./interfaces/traceable";
import { Observables, StackTrace }         from "./types";

// eslint-disable-next-line object-shorthand
const wrapper = { "Window": /* istanbul ignore next */ function () { /* */ } }.Window as object as typeof Window;

wrapper.prototype = window;
wrapper.prototype.constructor = wrapper;

const windowWrapper = wrapper.prototype;

function buildStackTrace(stackTrace: StackTrace): string
{
    return stackTrace.map((entry, i) => entry.map(value => "   ".repeat(i) + value).join("\n")).join("\n");
}

export function createHostScope(host: HTMLElement): object
{
    return { $class: classMap, $style: styleMap, host };
}

export function createScope(scope: object): object
{
    const handler: ProxyHandler<Indexer> =
    {
        get:                      (target, key) => key in target ? target[key as string] : (windowWrapper as object as Indexer)[key as string],
        getOwnPropertyDescriptor: (target, key) =>
            Object.getOwnPropertyDescriptor(target, key) ?? Object.getOwnPropertyDescriptor(windowWrapper, key),
        has: (target, key) => key in target || key in windowWrapper,
        set: (target, key, value) =>
        {
            if (typeof key == "symbol")
            {
                target[key as unknown as string] = value;

                return true;
            }

            throw new ReferenceError(`Assignment to constant variable "${String(key)}"`);
        },
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

export function scapeBrackets(value: string): string
{
    return value.replace(/(?<!\\)\\{/g, "{").replace(/\\\\{/g, "\\");
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

export function throwTemplateParseError(message: string, stackTrace: StackTrace): never
{
    throw new TemplateParseError(message, buildStackTrace(stackTrace));
}

export function tryEvaluateExpression(scope: object, expression: IExpression, rawExpression: string, stackTrace: StackTrace): unknown
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

export function tryEvaluateExpressionByTraceable(scope: object, traceable: { expression: IExpression } & ITraceable): unknown
{
    return tryEvaluateExpression(scope, traceable.expression, traceable.rawExpression, traceable.stackTrace);
}

export function tryEvaluateKeyExpressionByTraceable(scope: object, traceable: { keyExpression: IExpression } & IKeyValueTraceable): unknown
{
    return tryEvaluateExpression(scope, traceable.keyExpression, traceable.rawKeyExpression, traceable.stackTrace);
}

export function tryEvaluatePattern(scope: object, pattern: IPattern, value: unknown, rawExpression: string, stackTrace: StackTrace): Indexer
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

export function tryEvaluatePatternByTraceable(scope: object, value: unknown, traceable: { pattern: IPattern } & ITraceable): Indexer
{
    return tryEvaluatePattern(scope, traceable.pattern, value, traceable.rawExpression, traceable.stackTrace);
}

export function tryObserve(scope: object, observables: Observables, listener: IListener, rawExpression: string, stackTrace: StackTrace, lazy?: boolean): ISubscription
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

export function tryObserveByObservable(scope: object, observable: IObservable & ITraceable, listener: IListener, lazy?: boolean): ISubscription
{
    return tryObserve(scope, observable.observables, listener, observable.rawExpression, observable.stackTrace, lazy);
}

export function tryObserveKeyByObservable(scope: object, observable: IKeyValueObservable & IKeyValueTraceable, listener: IListener, lazy?: boolean): ISubscription
{
    return tryObserve(scope, observable.keyObservables, listener, observable.rawKeyExpression, observable.stackTrace, lazy);
}

export function *enumerateRange(start: ChildNode, end: ChildNode): Iterable<ChildNode>
{
    let simbling: ChildNode | null = null;

    while ((simbling = start.nextSibling) && simbling != end)
    {
        yield simbling;
    }
}