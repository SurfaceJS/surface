import { Action1, IDisposable }                                from "@surface/core";
import { TypeGuard }                                           from "@surface/expression";
import { ISubscription }                                       from "@surface/reactive";
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
        this.action  = this.evaluate(scope, directive);

        const notify = () => this.keyHandler(`${tryEvaluateExpression(scope, directive.keyExpression, directive.rawExpression, directive.stackTrace)}`);

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


    private evaluate(scope: Scope, directive: IDirective): Action1<Event>
    {
        if (TypeGuard.isArrowFunctionExpression(directive.expression) || TypeGuard.isIdentifier(directive.expression))
        {
            return directive.expression.evaluate(scope) as Action1<Event>;
        }
        else if (TypeGuard.isMemberExpression(directive.expression))
        {
            const action = tryEvaluateExpression(scope, directive.expression, directive.rawExpression, directive.stackTrace) as Function;

            if (!action)
            {
                throwTemplateEvaluationError(`Evaluation error in ${directive.rawExpression}: ${directive.expression} is not defined`, directive.stackTrace);
            }

            return action.bind(directive.expression.object.evaluate(scope, true)) as Action1<Event>;
        }
        else
        {
            return () => tryEvaluateExpression(scope, directive.expression, directive.rawExpression, directive.stackTrace);
        }
    }

    public dispose(): void
    {
        this.subscription.unsubscribe();
        this.element.removeEventListener(this.key, this.action);
    }
}