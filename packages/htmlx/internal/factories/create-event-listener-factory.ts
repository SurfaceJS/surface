import type { StackTrace }   from "@surface/htmlx-parser";
import eventListener         from "../common.js";
import type AttributeFactory from "../types/attribute-factory.js";
import type Evaluator        from "../types/evaluator.js";

export default function createEventListenerFactory(type: string, listenerEvaluator: Evaluator, contextEvaluator: Evaluator, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
        eventListener(element, scope, type, listenerEvaluator, contextEvaluator, source, stackTrace);
}