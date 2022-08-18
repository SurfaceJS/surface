import type { IDisposable }                from "@surface/core";
import { typeGuard }                       from "@surface/core";
import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import { buildStackTrace }                 from "../common.js";
import TemplateProcessError                from "../errors/template-process-error.js";
import type AttributeFactory               from "../types/attribute-factory";
import type DirectiveContext               from "../types/directive-context";
import type Evaluator                      from "../types/evaluator";

type DirectiveFactory = (context: DirectiveContext) => IDisposable;

export default function createDirectiveFactory(key: string, evaluator: Evaluator, observables: ObservablePath[], source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope, directives) =>
    {
        const disposables: IDisposable[] = [];
        const handlerConstructor = directives.get(key);

        if (!handlerConstructor)
        {
            throw new TemplateProcessError(`Unregistered directive #${key}.`, buildStackTrace(stackTrace ?? []));
        }

        const context: DirectiveContext =
        {
            element,
            key,
            observables,
            scope,
            source,
            stackTrace,
            value: evaluator,
        };

        if (typeGuard<DirectiveFactory>(handlerConstructor, !handlerConstructor.prototype))
        {
            disposables.push(handlerConstructor(context));
        }
        else
        {
            disposables.push(new handlerConstructor(context));
        }

        return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
    };
}