import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import { tryObserve }                      from "../common.js";
import type AttributeFactory               from "../types/attribute-factory.js";
import type Evaluator                      from "../types/evaluator.js";

export default function createInterpolationFactory(key: string, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const listener = (): void => element.setAttribute(key, `${evaluator(scope)}`);

        const subscription = tryObserve(scope, observables, listener, true, source, stackTrace);

        listener();

        return { dispose: () => subscription.unsubscribe() };
    };
}