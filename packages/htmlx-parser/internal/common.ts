import TemplateParseError       from "./errors/template-parse-error.js";
import type StackTrace          from "./types/stack-trace.js";

export function buildStackTrace(stackTrace: StackTrace): string
{
    return stackTrace.map((entry, i) => entry.map(value => "   ".repeat(i) + value).join("\n")).join("\n");
}

export function scapeBrackets(value: string): string
{
    return value.replace(/(?<!\\)\\{/g, "{").replace(/\\\\{/g, "\\");
}

export function throwTemplateParseError(message: string, stackTrace: StackTrace): never
{
    throw new TemplateParseError(message, buildStackTrace(stackTrace));
}