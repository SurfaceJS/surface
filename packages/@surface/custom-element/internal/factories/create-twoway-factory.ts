import { checkPath, checkProperty, tryBind } from "../common.js";
import type AttributeFactory                 from "../types/attribute-fatctory.js";
import type ObservablePath                   from "../types/observable-path.js";
import type StackTrace                       from "../types/stack-trace";

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