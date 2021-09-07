import type { StackTrace }         from "../../types/index.js";
import { tryEvaluate, tryObserve } from "../common.js";
import type Activator              from "../types/activator";
import type Evaluator              from "../types/evaluator";
import type NodeFactory            from "../types/node-fatctory";
import type ObservablePath         from "../types/observable-path";

export default function textNodeFactory(evaluator: Evaluator, observables?: ObservablePath[], source?: string, stackTrace?: StackTrace): NodeFactory
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
