import { resolveError }                                               from "@surface/core";
import type { StackTrace }                                            from "@surface/htmlx-parser";
import { buildStackTrace, throwTemplateEvaluationError, tryEvaluate } from "../common.js";
import CustomStackError                                               from "../errors/custom-stack-error.js";
import { scheduler }                                                  from "../singletons.js";
import type AttributeFactory                                          from "../types/attribute-factory.js";
import type Evaluator                                                 from "../types/evaluator.js";

export default function createExtendsAttributesFactory(evaluator: Evaluator, source?: string, stackTrace?: StackTrace): AttributeFactory
{
    return (element, scope) =>
    {
        try
        {
            const evaluated = tryEvaluate(scope, evaluator, source, stackTrace) as object;

            const target = evaluated instanceof HTMLElement
                ? evaluated
                : null;

            if (target)
            {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let index = 0; index < target.attributes.length; index++)
                {
                    const attribute = target.attributes[index];

                    element.setAttribute(attribute.name, attribute.value);
                }

                const callback: MutationCallback = records =>
                {
                    const action = (): void =>
                    {
                        for (const record of records)
                        {
                            const value = target.getAttribute(record.attributeName!);

                            if (value === null)
                            {
                                element.removeAttribute(record.attributeName!);
                            }
                            else
                            {
                                element.setAttribute(record.attributeName!, value);
                            }
                        }
                    };

                    void scheduler.enqueue(action, "normal");
                };

                const observer = new MutationObserver(callback);

                observer.observe(target, { attributes: true });

                return { dispose: () => observer.disconnect() };
            }

            throw new CustomStackError("Target is not an HTMLElement", stackTrace ? buildStackTrace(stackTrace) : "");
        }
        catch (error)
        {
            if (stackTrace)
            {
                throwTemplateEvaluationError(resolveError(error).message, stackTrace);
            }

            throw error;
        }
    };
}