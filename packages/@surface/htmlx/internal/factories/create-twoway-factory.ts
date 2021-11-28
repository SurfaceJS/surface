import type { IDisposable }                  from "@surface/core";
import type { ObservablePath, StackTrace }   from "@surface/htmlx-parser";
import { checkPath, checkProperty, tryBind } from "../common.js";
import Metadata                              from "../metadata.js";
import type AttributeFactory                 from "../types/attribute-factory.js";

function bind(element: HTMLElement, scope: object, left: string, right: ObservablePath, source?: string, stackTrace?: StackTrace): IDisposable
{
    checkProperty(element, left, source, stackTrace);

    const subscription = tryBind(element, [left], scope as object, right, source, stackTrace);

    return { dispose: () => subscription.unsubscribe() };
}

export default function createTwowayFactory(left: string, right: ObservablePath, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        checkPath(scope, right, source, stackTrace);

        const disposables: IDisposable[] = [];

        disposables.push(bind(element, scope, left, right, source, stackTrace));

        for (const linkedElement of Metadata.from(element).linkedElements.binds.twoway)
        {
            disposables.push(bind(linkedElement, element, left, [left], source, stackTrace));
        }

        return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
    };
}