import { Action1 }                                             from "@surface/core";
import IDisposable                                             from "@surface/core/interfaces/disposable";
import IExpression                                             from "@surface/expression/interfaces/expression";
import TypeGuard                                               from "@surface/expression/type-guard";
import ISubscription                                           from "@surface/reactive/interfaces/subscription";
import { throwTemplateEvaluationError, tryEvaluateExpression } from "../../common";
import DataBind                                                from "../../data-bind";
import IDirective                                              from "../../interfaces/directive";
import { Scope }                                               from "../../types";

export default class EventDirectiveHandler implements IDisposable
{
    private readonly action:       Action1<Event>;
    private readonly element:      Element;
    private readonly subscription: ISubscription;

    private key: string = "";

    public constructor(scope: Scope, element: Element, directive: IDirective)
    {
        this.element = element;
        this.action  = this.evaluate(scope, directive.value, directive.stackTrace);

        const notify = () => this.keyHandler(`${tryEvaluateExpression(scope, directive.key, directive.stackTrace)}`);

        this.subscription = DataBind.observe(scope, directive.keyObservables, { notify }, false);

        notify();
    }

    private keyHandler(key: string): void
    {
        if (key != this.key)
        {
            if (this.key)
            {
                this.element.removeEventListener(this.key, this.action);
            }

            if (key)
            {
                this.element.addEventListener(key, this.action);
            }

            this.key = key;
        }
    }


    private evaluate(scope: Scope, expression: IExpression, stackTrace: Array<Array<string>>): Action1<Event>
    {
        if (TypeGuard.isArrowFunctionExpression(expression) || TypeGuard.isIdentifier(expression))
        {
            return expression.evaluate(scope) as Action1<Event>;
        }
        else if (TypeGuard.isMemberExpression(expression))
        {
            const action = tryEvaluateExpression(scope, expression, stackTrace) as Function;

            if (!action)
            {
                throwTemplateEvaluationError(`${expression} is not defined`, stackTrace);
            }

            return action.bind(expression.object.evaluate(scope, true)) as Action1<Event>;
        }
        else
        {
            return () => tryEvaluateExpression(scope, expression, stackTrace);
        }
    }

    public dispose(): void
    {
        this.subscription.unsubscribe();
        this.element.removeEventListener(this.key, this.action);
    }
}