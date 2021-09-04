import type { Delegate }      from "@surface/core";
import { classMap, styleMap } from "../../common.js";
import observe                from "../observe.js";
import type AttributeFactory  from "../types/attribute-fatctory.js";
import type Evaluator         from "../types/evaluator.js";
import type ObservablePath    from "../types/observable-path.js";

export default function onewayFactory(key: string, value: Evaluator, observables: ObservablePath[]): AttributeFactory
{
    return (element, scope) =>
    {
        let listener: Delegate;

        if (key == "class" || key == "style")
        {
            listener = key == "class"
                ? () => element.setAttribute(key, classMap(value(scope) as Record<string, boolean>))
                : () => element.setAttribute(key, styleMap(value(scope) as Record<string, boolean>));
        }
        else
        {
            listener = () => void ((element as unknown as Record<string, unknown>)[key] = value(scope));
        }

        const subscription = observe(scope, observables, listener, true);

        listener();

        return { dispose: () => subscription.unsubscribe() };
    };
}