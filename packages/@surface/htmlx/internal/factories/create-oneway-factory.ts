import type { Delegate, IDisposable }                                 from "@surface/core";
import type { ObservablePath, StackTrace      }                       from "@surface/htmlx-parser";
import { checkProperty, classMap, styleMap, tryEvaluate, tryObserve } from "../common.js";
import Metadata                                                       from "../metadata.js";
import type AttributeFactory                                          from "../types/attribute-factory.js";
import type Evaluator                                                 from "../types/evaluator.js";

function bind(element: HTMLElement, scope: object, key: string, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): IDisposable
{
    let listener: Delegate;

    if (key == "class" || key == "style")
    {
        listener = key == "class"
            ? () => element.setAttribute(key, classMap(tryEvaluate(scope, evaluator, source, stackTrace) as Record<string, boolean>))
            : () => element.setAttribute(key, styleMap(tryEvaluate(scope, evaluator, source, stackTrace) as Record<string, boolean>));
    }
    else
    {
        checkProperty(element, key, source, stackTrace);

        listener = () => void ((element as unknown as Record<string, unknown>)[key] = tryEvaluate(scope, evaluator, source, stackTrace));
    }

    const subscription = tryObserve(scope, observables, listener, true, source, stackTrace);

    listener();

    return { dispose: () => subscription.unsubscribe() };
}

export default function createOnewayFactory(key: string, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        const disposables: IDisposable[] = [];

        disposables.push(bind(element, scope, key, evaluator, observables, source, stackTrace));

        for (const linkedElement of Metadata.from(element).linkedElements.binds.oneway)
        {
            disposables.push(bind(linkedElement, { host: element }, key, () => (element as unknown as Record<string, unknown>)[key], [["host", key]], source, stackTrace));
        }

        return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
    };
}