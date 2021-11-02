import type { ObservablePath, StackTrace }   from "@surface/htmlx-parser";
import { checkPath, checkProperty, tryBind } from "../common.js";
import type AttributeFactory                 from "../types/attribute-factory.js";

export default function createTwowayFactory(left: string, right: ObservablePath, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        checkProperty(element, left, source, stackTrace);
        checkPath(scope, right, source, stackTrace);

        const subscription = tryBind(element, [left], scope as object, right, source, stackTrace);

        return { dispose: () => subscription.unsubscribe() };
    };
}