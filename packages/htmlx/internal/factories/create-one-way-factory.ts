import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import { oneWayBind }                      from "../common.js";
import type AttributeFactory               from "../types/attribute-factory.js";
import type Evaluator                      from "../types/evaluator.js";

export default function createOneWayFactory(key: string, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const disposable = oneWayBind(element, scope, key, evaluator, observables, source, stackTrace);

        element.dispatchEvent(new Event("bind"));

        return disposable;
    };
}
