import observe               from "../observe.js";
import type AttributeFactory from "../types/attribute-fatctory.js";
import type Evaluator        from "../types/evaluator.js";
import type ObservablePath   from "../types/observable-path.js";

export default function interpolationFactory(key: string, value: Evaluator, observables: ObservablePath[]): AttributeFactory
{
    return (element, scope) =>
    {
        const listener = (): void => element.setAttribute(key, `${value(scope)}`);

        const subscription = observe(scope, observables, listener, true);

        listener();

        return { dispose: () => subscription.unsubscribe() };
    };
}