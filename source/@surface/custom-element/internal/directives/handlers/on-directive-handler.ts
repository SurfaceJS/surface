import { Action1, IDisposable } from "@surface/core";
import { TypeGuard }            from "@surface/expression";
import { ISubscription }        from "@surface/reactive";
import
{
    throwTemplateEvaluationError,
    tryEvaluateExpression,
    tryEvaluateKeyExpressionByTraceable,
    tryObserveKeyByObservable
} from "../../common";
import ICustomDirective from "../../interfaces/directives/custom-directive";

export default class OnDirectiveHandler implements IDisposable
{
    private readonly action:       Action1<Event>;
    private readonly element:      Element;
    private readonly subscription: ISubscription;

    private key: string = "";

    public constructor(scope: object, element: Element, directive: ICustomDirective)
    {
        this.element = element;
        this.action  = this.evaluate(scope, directive);

        const notify = () => this.keyHandler(`${tryEvaluateKeyExpressionByTraceable(scope, directive)}`);

        this.subscription = tryObserveKeyByObservable(scope, directive, { notify }, false);

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

    private evaluate(scope: object, directive: ICustomDirective): Action1<Event>
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