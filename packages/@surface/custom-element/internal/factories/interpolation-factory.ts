import { tryObserve }        from "../common.js";
import type AttributeFactory from "../types/attribute-fatctory.js";
import type Evaluator        from "../types/evaluator.js";
import type ObservablePath   from "../types/observable-path.js";
import type StackTrace       from "../types/stack-trace";

export default function interpolationFactory(key: string, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const listener = (): void => element.setAttribute(key, `${evaluator(scope)}`);

        const subscription = tryObserve(scope, observables, listener, true, source, stackTrace);

        listener();

        return { dispose: () => subscription.unsubscribe() };
    };
}