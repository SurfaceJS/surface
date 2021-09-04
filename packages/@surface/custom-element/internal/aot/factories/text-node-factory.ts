import observe             from "../observe.js";
import type Activator      from "../types/activator";
import type Evaluator      from "../types/evaluator";
import type NodeFactory    from "../types/node-fatctory";
import type ObservablePath from "../types/observable-path";

export default function textNodeFactory(expression: Evaluator<string>, observables: ObservablePath[]): NodeFactory
{
    return () =>
    {
        const node = document.createTextNode("");

        const activator: Activator = (_parent, _host, scope) =>
        {
            const listener = (): void => void (node.nodeValue = expression(scope));

            const subscription = observe(scope, observables, listener, true);

            listener();

            return { dispose: () => subscription.unsubscribe() };
        };

        return [node, activator];
    };
}
