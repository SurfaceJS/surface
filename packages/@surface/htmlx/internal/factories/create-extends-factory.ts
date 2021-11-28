import type { IDisposable }  from "@surface/core";
import type { StackTrace }   from "@surface/htmlx-parser";
import { tryEvaluate }       from "../common.js";
import Metadata              from "../metadata.js";
import type AttributeFactory from "../types/attribute-factory.js";
import type Evaluator        from "../types/evaluator.js";

type Selector = "*" | "binds" | `binds.${"oneway" | "twoway"}` | "listeners";

export default function createExtendsFactory(evaluator: Evaluator, selector: Selector, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const target = tryEvaluate(scope, evaluator, source, stackTrace);

        const metadata = target instanceof HTMLElement ? Metadata.of(target) : null;

        if (!metadata)
        {
            throw new Error("Target don't has metadata.");
        }

        const disposables: IDisposable[] = [];

        if (selector == "*" || selector == "binds" || selector == "binds.oneway")
        {
            const index = metadata.linkedElements.binds.oneway.length;

            metadata.linkedElements.binds.oneway.push(element);

            disposables.push({ dispose: () => metadata.linkedElements.binds.oneway.splice(index, 1) });
        }

        if (selector == "*" || selector == "binds" || selector == "binds.twoway")
        {
            const index = metadata.linkedElements.binds.twoway.length;

            metadata.linkedElements.binds.twoway.push(element);

            disposables.push({ dispose: () => metadata.linkedElements.binds.twoway.splice(index, 1) });
        }

        if (selector == "*" || selector == "listeners")
        {
            const index = metadata.linkedElements.listeners.length;

            metadata.linkedElements.listeners.push(element);

            disposables.push({ dispose: () => metadata.linkedElements.listeners.splice(index, 1) });
        }

        return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
    };
}