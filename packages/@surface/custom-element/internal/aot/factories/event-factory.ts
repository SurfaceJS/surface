import type { StackTrace }   from "../../types/index.js";
import { tryEvaluate }       from "../common.js";
import type AttributeFactory from "../types/attribute-fatctory.js";
import type Evaluator        from "../types/evaluator.js";

export default function eventFactory(key: string, evaluator: Evaluator, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const listener = tryEvaluate(scope, evaluator, source, stackTrace) as () => void;

        element.addEventListener(key, listener);

        return { dispose: () => element.removeEventListener(key, listener) };
    };
}