import type { Delegate, IDisposable } from "@surface/core";
import
{
    throwTemplateEvaluationError,
    tryEvaluateExpression,
} from "../common.js";
import type EventDirectiveDescriptor from "../types/event-directive-descriptor";

export default class EventDirective implements IDisposable
{
    private readonly action:  Delegate<[Event]>;
    private readonly element: Element;
    private readonly name:    string;

    public constructor(scope: object, element: Element, descriptor: EventDirectiveDescriptor)
    {
        this.name    = descriptor.name;
        this.element = element;
        this.action  = this.evaluate(scope, descriptor);

        this.element.addEventListener(this.name, this.action);
    }

    private evaluate(scope: object, directive: EventDirectiveDescriptor): Delegate<[Event]>
    {
        const action = tryEvaluateExpression(scope, directive.expression, directive.rawExpression, directive.stackTrace);

        if (!action)
        {
            throwTemplateEvaluationError(`Evaluation error in ${directive.rawExpression}: ${directive.expression} is not defined`, directive.stackTrace);
        }

        if (!(action instanceof Function))
        {
            throwTemplateEvaluationError(`Evaluation error in ${directive.rawExpression}: ${directive.expression} is not a function`, directive.stackTrace);
        }

        return action as Delegate<[Event]>;
    }

    public dispose(): void
    {
        this.element.removeEventListener(this.name, this.action);
    }
}