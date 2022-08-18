import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import { twoWayBind }                      from "../common.js";
import type AttributeFactory               from "../types/attribute-factory.js";

export default function createTwoWayFactory(left: string, right: ObservablePath, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
        twoWayBind(element, scope, left, right, source, stackTrace);
}
