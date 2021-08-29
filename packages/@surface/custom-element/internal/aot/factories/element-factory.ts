/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-keys */
import type { IDisposable, Subscription } from "@surface/core";
import bind                               from "../bind.js";
import Directive                          from "../directive.js";
import observe                            from "../observe.js";
import type Activator                     from "../types/activator";
import type Expression                    from "../types/expression.js";
import type Factory                       from "../types/fatctory";
import type ObservablePath                from "../types/observable-path.js";

export default function elementFactory
(
    tag:               string,
    attributes?:       [key: string, value: string][],
    binds?:            [type: "oneway" | "twoway" | "interpolation", key: string, value: Expression, observables: ObservablePath[]][],
    events?:           [key: string, value: Expression][],
    customDirectives?: [key: Expression, value: Expression, observables: [key: ObservablePath[], value: ObservablePath[]]][],
    childs?:           Factory[],
): Factory
{
    return () =>
    {
        const element = document.createElement(tag);

        window.customElements.upgrade(element);

        if (attributes)
        {
            for (const [key, value] of attributes)
            {
                element.setAttribute(key, value);
            }
        }

        const activators: Activator[] = [];

        if (childs)
        {
            for (const childFactory of childs)
            {
                const [childElement, activator] = childFactory();

                // TODO: Allow factory returns multiples nodes.
                element.appendChild(childElement);

                activators.push(activator);
            }
        }

        const activator: Activator = (_parent, host, scope, directives) =>
        {
            const disposables:   IDisposable[]  = [];
            const subscriptions: Subscription[] = [];

            for (const activator of activators)
            {
                disposables.push(activator(element, host, scope, directives));
            }

            if (binds)
            {
                for (const [type, key, expression, observables] of binds)
                {
                    switch (type)
                    {
                        case "oneway":
                            subscriptions.push(observe(scope, observables, (): void => void ((element as unknown as Record<string, unknown>)[key] = expression(scope)), false));

                            break;
                        case "twoway":
                            subscriptions.push(bind(element, [key], scope as object, observables[0]));

                            break;
                        default:
                            subscriptions.push(observe(scope, observables, (): void => element.setAttribute(key, `${expression(scope)}`), false));

                    }

                }
            }

            if (events)
            {
                for (const [key, expression] of events)
                {
                    const listener = expression(scope) as () => void;

                    element.addEventListener(key, listener);

                    subscriptions.push({ unsubscribe: () => element.removeEventListener(key, listener) });
                }
            }

            if (customDirectives)
            {
                for (const [key, expression, observables] of customDirectives)
                {
                    disposables.push(new Directive({ element, scope, key, expression, observables }));
                }
            }

            return { dispose: () => (subscriptions.splice(0).forEach(x => x.unsubscribe()), disposables.splice(0).forEach(x => x.dispose())) };
        };

        return [element, activator];
    };
}

