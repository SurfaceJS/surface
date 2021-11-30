import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import { twowaybind }                      from "../common.js";
import type AttributeFactory               from "../types/attribute-factory.js";

export default function createTwowayFactory(left: string, right: ObservablePath, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
        twowaybind(element, scope, left, right, source, stackTrace);
}