import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import { onewaybind }                      from "../common.js";
import type AttributeFactory               from "../types/attribute-factory.js";
import type Evaluator                      from "../types/evaluator.js";

export default function createOnewayFactory(key: string, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
        onewaybind(element, scope, key, evaluator, observables, source, stackTrace);
}