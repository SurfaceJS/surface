import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import type { Context }                    from "../directives/spread-directive.js";
import SpreadDirective                     from "../directives/spread-directive.js";
import type AttributeFactory               from "../types/attribute-factory.js";
import type Evaluator                      from "../types/evaluator.js";
import type SpreadFactory                  from "../types/spread-factory.js";

export default function createSpreadFactory(evaluator: Evaluator, observables: ObservablePath[], factories: SpreadFactory[], source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const context: Context =
        {
            element,
            evaluator,
            factories,
            observables,
            scope,
            source,
            stackTrace,
        };

        return new SpreadDirective(context);
    };
}