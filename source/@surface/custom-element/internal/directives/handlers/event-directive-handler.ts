import { Delegate, IDisposable } from "@surface/core";
import { TypeGuard }             from "@surface/expression";
import
{
    throwTemplateEvaluationError,
    tryEvaluateExpression,
} from "../../common";
import IEventDirective from "../../interfaces/event-directive";

export default class EventDirectiveHandler implements IDisposable
{
    private readonly action:  Delegate<[Event]>;
    private readonly element: Element;
    private readonly name:    string;

    public constructor(scope: object, element: Element, directive: IEventDirective)
    {
        this.name    = directive.name;
        this.element = element;
        this.action  = this.evaluate(scope, directive);

        this.element.addEventListener(this.name, this.action);
    }

    private evaluate(scope: object, directive: IEventDirective): Delegate<[Event]>
    {
        if (TypeGuard.isArrowFunctionExpression(directive.expression) || TypeGuard.isIdentifier(directive.expression))
        {
            return directive.expression.evaluate(scope) as Delegate<[Event]>;
        }
        else if (TypeGuard.isMemberExpression(directive.expression))
        {
            const action = tryEvaluateExpression(scope, directive.expression, directive.rawExpression, directive.stackTrace) as Function;

            if (!action)
            {
                throwTemplateEvaluationError(`Evaluation error in ${directive.rawExpression}: ${directive.expression} is not defined`, directive.stackTrace);
            }

            return action.bind(directive.expression.object.evaluate(scope, true)) as Delegate<[Event]>;
        }

        return () => tryEvaluateExpression(scope, directive.expression, directive.rawExpression, directive.stackTrace);
    }

    public dispose(): void
    {
        this.element.removeEventListener(this.name, this.action);
    }
}