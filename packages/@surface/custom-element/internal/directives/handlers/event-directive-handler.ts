import type { Delegate, IDisposable, Indexer } from "@surface/core";
import { assert }                              from "@surface/core";
import { TypeGuard }                           from "@surface/expression";
import
{
    throwTemplateEvaluationError,
    tryEvaluateExpression,
} from "../../common.js";
import type IEventDirective from "../../interfaces/event-directive";

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
            const key = TypeGuard.isIdentifier(directive.expression.property) && !directive.expression.computed ?  directive.expression.property.name : `${directive.expression.property.evaluate(scope)}`;

            const thisArg = directive.expression.object.evaluate(scope) as Indexer;

            let action: Function | undefined;

            try
            {
                action = thisArg[key] as Function | undefined;
            }
            catch (error)
            {
                assert(error instanceof Error);

                throwTemplateEvaluationError(`Evaluation error in ${directive.rawExpression}: ${error.message}`, directive.stackTrace);
            }

            if (!action)
            {
                throwTemplateEvaluationError(`Evaluation error in ${directive.rawExpression}: ${directive.expression} is not defined`, directive.stackTrace);
            }

            return action.bind(thisArg) as Delegate<[Event]>;
        }

        return () => tryEvaluateExpression(scope, directive.expression, directive.rawExpression, directive.stackTrace);
    }

    public dispose(): void
    {
        this.element.removeEventListener(this.name, this.action);
    }
}