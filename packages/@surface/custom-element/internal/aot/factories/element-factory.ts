/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-keys */
import type { IDisposable, Subscription } from "@surface/core";
import bind                               from "../bind.js";
import Directive                          from "../directive.js";
import observe                            from "../observe.js";
import type Activator                     from "../types/activator";
import type ElementDescriptor             from "../types/element-descriptor";
import type Factory                       from "../types/fatctory";

export default function elementFactory(descriptor: ElementDescriptor): Factory
{
    return () =>
    {
        const element = document.createElement(descriptor.tag);

        window.customElements.upgrade(element);

        if (descriptor.attributes)
        {
            for (const [key, value] of descriptor.attributes)
            {
                element.setAttribute(key, value);
            }
        }

        const activators: Activator[] = [];

        if (descriptor.childs)
        {
            for (const childFactory of descriptor.childs)
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

            if (descriptor.interpolation)
            {
                for (const [key, expression, observables] of descriptor.interpolation)
                {
                    const listener = (): void => element.setAttribute(key, `${expression(scope)}`);

                    subscriptions.push(observe(scope, observables, listener, false));
                }
            }

            if (descriptor.oneWay)
            {
                for (const [key, expression, observables] of descriptor.oneWay)
                {
                    const task = (): void => void ((element as unknown as Record<string, unknown>)[key] = expression(scope));

                    subscriptions.push(observe(scope, observables, task, false));
                }
            }

            if (descriptor.twoWay)
            {
                for (const [key, expression, observables] of descriptor.twoWay)
                {
                    expression(scope);

                    subscriptions.push(bind(element, [key], scope as object, observables));
                }
            }

            if (descriptor.events)
            {
                for (const [key, expression] of descriptor.events)
                {
                    const listener = expression(scope) as () => void;

                    element.addEventListener(key, listener);

                    subscriptions.push({ unsubscribe: () => element.removeEventListener(key, listener) });
                }
            }

            if (descriptor.directives)
            {
                for (const [key, expression, observables] of descriptor.directives)
                {
                    disposables.push(new Directive({ element, scope, key, expression, observables }));
                }
            }

            return { dispose: () => (subscriptions.splice(0).forEach(x => x.unsubscribe()), disposables.splice(0).forEach(x => x.dispose())) };
        };

        return [element, activator];
    };
}

