import observe             from "../observe.js";
import type Activator       from "../types/activator";
import type Expression     from "../types/expression";
import type Factory        from "../types/fatctory";
import type ObservablePath from "../types/observable-path";

export default function textNodeFactory(expression: Expression<string>, observables: ObservablePath[]): Factory
{
    return () =>
    {
        const node = document.createTextNode("");

        const activator: Activator = (_parent, _host, scope) =>
        {
            const listener = (): void => void (node.nodeValue = expression(scope));

            const subscription = observe(scope, observables, listener, false);

            return { dispose: () => subscription.unsubscribe() };
        };

        return [node, activator];
    };
}
