import type { IDisposable }  from "@surface/core";
import type { StackTrace }   from "@surface/htmlx-parser";
import { tryEvaluate }       from "../common.js";
import Metadata              from "../metadata.js";
import type AttributeFactory from "../types/attribute-factory.js";
import type Evaluator        from "../types/evaluator.js";

export default function createEventFactory(name: string, listenerEvaluator: Evaluator, contextEvaluator: Evaluator, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const disposables: IDisposable[] = [];

        const context  = tryEvaluate(scope, contextEvaluator, source, stackTrace) as object | undefined;
        const listener = (tryEvaluate(scope, listenerEvaluator, source, stackTrace) as () => void).bind(context ?? element);

        element.addEventListener(name, listener);

        disposables.push({ dispose: () => element.removeEventListener(name, listener) });

        for (const linkedElement of Metadata.from(element).linkedElements.listeners)
        {
            linkedElement.addEventListener(name, listener);

            disposables.push({ dispose: () => linkedElement.removeEventListener(name, listener) });
        }

        return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
    };
}