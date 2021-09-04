import bind                  from "../bind.js";
import type AttributeFactory from "../types/attribute-fatctory.js";
import type ObservablePath   from "../types/observable-path.js";

export default function twowayFactory(left: string, right: ObservablePath): AttributeFactory
{
    return (element, scope) =>
    {
        const subscription = bind(element, [left], scope as object, right);

        return { dispose: () => subscription.unsubscribe() };
    };
}