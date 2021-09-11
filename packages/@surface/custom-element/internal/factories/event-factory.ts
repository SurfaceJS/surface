import { tryEvaluate }       from "../common.js";
import type AttributeFactory from "../types/attribute-fatctory.js";
import type Evaluator        from "../types/evaluator.js";
import type StackTrace       from "../types/stack-trace";

export default function eventFactory(key: string, listenerEvaluator: Evaluator, contextEvaluator: Evaluator, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const context  = tryEvaluate(scope, contextEvaluator, source, stackTrace) as object | undefined;
        const listener = (tryEvaluate(scope, listenerEvaluator, source, stackTrace) as () => void).bind(context ?? element);

        element.addEventListener(key, listener);

        return { dispose: () => element.removeEventListener(key, listener) };
    };
}