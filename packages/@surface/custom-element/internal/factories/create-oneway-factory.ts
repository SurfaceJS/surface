import type { Delegate }                                              from "@surface/core";
import { checkProperty, classMap, styleMap, tryEvaluate, tryObserve } from "../common.js";
import type AttributeFactory                                          from "../types/attribute-fatctory.js";
import type Evaluator                                                 from "../types/evaluator.js";
import type ObservablePath                                            from "../types/observable-path.js";
import type StackTrace                                                from "../types/stack-trace";

export default function createOnewayFactory(key: string, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        let listener: Delegate;

        if (key == "class" || key == "style")
        {
            listener = key == "class"
                ? () => element.setAttribute(key, classMap(tryEvaluate(scope, evaluator, source, stackTrace) as Record<string, boolean>))
                : () => element.setAttribute(key, styleMap(tryEvaluate(scope, evaluator, source, stackTrace) as Record<string, boolean>));
        }
        else
        {
            checkProperty(element, key, source, stackTrace);

            listener = () => void ((element as unknown as Record<string, unknown>)[key] = tryEvaluate(scope, evaluator, source, stackTrace));
        }

        const subscription = tryObserve(scope, observables, listener, true, source, stackTrace);

        listener();

        return { dispose: () => subscription.unsubscribe() };
    };
}