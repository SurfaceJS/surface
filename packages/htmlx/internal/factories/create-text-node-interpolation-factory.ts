import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import { tryEvaluate, tryObserve }         from "../common.js";
import type Activator                      from "../types/activator.js";
import type Evaluator                      from "../types/evaluator.js";
import type NodeFactory                    from "../types/node-factory.js";

export default function createTextNodeInterpolationFactory(evaluator: Evaluator, observables?: ObservablePath[], source?: string, stackTrace?: StackTrace): NodeFactory
{
    return () =>
    {
        const node = document.createTextNode("");

        const activator: Activator = (_parent, _host, scope) =>
        {
            const listener = (): void => void (node.nodeValue = String(tryEvaluate(scope, evaluator, source, stackTrace)));

            const subscription = tryObserve(scope, observables ?? [], listener, true, source, stackTrace);

            listener();

            return { dispose: () => subscription.unsubscribe() };
        };

        return [node, activator];
    };
}
