import { Indexer, Nullable }   from "@surface/core";
import { assert }              from "@surface/core/common/generic";
import Evaluate                from "@surface/expression/evaluate";
import IExpression             from "@surface/expression/interfaces/expression";
import IPattern                from "@surface/expression/interfaces/pattern";
import TemplateEvaluationError from "./errors/template-evaluation-error";
import TemplateParseError      from "./errors/template-parse-error";
import { Scope }               from "./types";

const wrapper = { "Window": /* istanbul ignore next */ function () { return; } }["Window"] as object as typeof Window;

wrapper.prototype = window;
wrapper.prototype.constructor = wrapper;

const windowWrapper = wrapper.prototype;

const TEMPLATE_OWNER = Symbol("custom-element:template-owner");

function buildStackTrace(stackTrace: Array<Array<string>>): string
{
    return stackTrace.map((entry, i) => entry.map(value => "   ".repeat(i) + value).join("\n")).join("\n");
}

export function createScope(scope: Indexer): Indexer
{
    scope["$class"] = classMap;
    scope["$style"] = styleMap;

    const handler: ProxyHandler<Indexer> =
    {
        get: (target, key) => key in target ? target[key as string] : (windowWrapper as Indexer)[key as string],
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

export function getTemplateOwner(element: Node & { [TEMPLATE_OWNER]?: HTMLTemplateElement }): HTMLTemplateElement|null
{
    return element[TEMPLATE_OWNER] ?? null;
}

export function scapeBrackets(value: string)
{
    return value.replace(/(?<!\\)\\{/g, "{").replace(/\\\\{/g, "\\");
}

export function setTemplateOwner(element: Node & { [TEMPLATE_OWNER]?: HTMLTemplateElement }, template: HTMLTemplateElement): void
{
    element[TEMPLATE_OWNER] = template;
}

export function styleMap(rules: Record<string, boolean>): string
{
    return Object.entries(rules)
        .map(([key, value]) => `${key}: ${value}` )
        .join("; ");
}

export function tryEvaluateExpression(scope: Scope, expression: IExpression, stackTrace: Array<Array<string>>): unknown
{
    try
    {
        return expression.evaluate(scope);
    }
    catch (error)
    {
        assert(error instanceof Error);

        throwTemplateEvaluationError(error.message, stackTrace);
    }
}

export function throwTemplateEvaluationError(message: string, stackTrace: Array<Array<string>>): never
{
    throw new TemplateEvaluationError(message, buildStackTrace(stackTrace));
}

export function throwTemplateParseError(message: string, stackTrace: Array<Array<string>>): never
{
    throw new TemplateParseError(message, buildStackTrace(stackTrace));
}

export function tryEvaluatePattern(scope: Scope, pattern: IPattern, value: unknown, stackTrace: Array<Array<string>>): Indexer
{
    try
    {
        return Evaluate.pattern(scope, pattern, value);
    }
    catch (error)
    {
        assert(error instanceof Error);

        throwTemplateEvaluationError(error.message, stackTrace);
    }
}

export function* enumerateRange(start: ChildNode, end: ChildNode): Iterable<ChildNode>
{
    let simbling: Nullable<ChildNode> = null;

    while ((simbling = start.nextSibling) && simbling != end)
    {
        yield simbling;
    }
}