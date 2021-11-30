import type { MetadataFlags, ObservablePath, StackTrace } from "@surface/htmlx-parser";
import type { Context }                                   from "../directives/spread-directive.js";
import SpreadDirective                                    from "../directives/spread-directive.js";
import type AttributeFactory                              from "../types/attribute-factory.js";
import type Evaluator                                     from "../types/evaluator.js";

export default function createSpreadFactory(flags: MetadataFlags, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const context: Context =
        {
            element,
            evaluator,
            flags,
            observables,
            scope,
            source,
            stackTrace,
        };

        return new SpreadDirective(context);
    };
}