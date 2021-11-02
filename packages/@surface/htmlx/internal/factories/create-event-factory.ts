import type { StackTrace }   from "@surface/custom-element-parser";
import { tryEvaluate }       from "../common.js";
import type AttributeFactory from "../types/attribute-factory.js";
import type Evaluator        from "../types/evaluator.js";

export default function createEventFactory(key: string, listenerEvaluator: Evaluator, contextEvaluator: Evaluator, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const context  = tryEvaluate(scope, contextEvaluator, source, stackTrace) as object | undefined;
        const listener = (tryEvaluate(scope, listenerEvaluator, source, stackTrace) as () => void).bind(context ?? element);

        element.addEventListener(key, listener);

        return { dispose: () => element.removeEventListener(key, listener) };
    };
}