import type AttributeFactory from "../types/attribute-fatctory.js";
import type Evaluator        from "../types/evaluator.js";

export default function eventFactory(key: string, value: Evaluator): AttributeFactory
{
    return (element, scope) =>
    {
        const listener = value(scope) as () => void;

        element.addEventListener(key, listener);

        return { dispose: () => element.removeEventListener(key, listener) };
    };
}