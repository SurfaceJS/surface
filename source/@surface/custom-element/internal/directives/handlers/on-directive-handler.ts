import { Action1 }   from "@surface/core";
import IDisposable   from "@surface/core/interfaces/disposable";
import IExpression   from "@surface/expression/interfaces/expression";
import TypeGuard     from "@surface/expression/internal/type-guard";
import ISubscription from "@surface/reactive/interfaces/subscription";
import DataBind      from "../../data-bind";
import IDirective    from "../../interfaces/directive";
import { Scope }     from "../../types";

export default class EventDirectiveHandler implements IDisposable
{
    private readonly action:       Action1<Event>;
    private readonly element:      Element;
    private readonly subscription: ISubscription;

    private key: string = "";

    public constructor(scope: Scope, element: Element, directive: IDirective)
    {
        this.element = element;
        this.action  = this.evaluate(scope, directive.value);

        const notify = () => this.keyHandler(`${directive.key.evaluate(scope)}`);

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


    private evaluate(scope: Scope, expression: IExpression): Action1<Event>
    {
        if (TypeGuard.isArrowFunctionExpression(expression) || TypeGuard.isIdentifier(expression))
        {
            return expression.evaluate(scope) as Action1<Event>;
        }
        else if (TypeGuard.isMemberExpression(expression))
        {
            const action = expression.evaluate(scope) as Function;

            return action.bind(expression.object.evaluate(scope)) as Action1<Event>;
        }
        else
        {
            return () => expression.evaluate(scope);
        }
    }

    public dispose(): void
    {
        this.subscription.unsubscribe();
        this.element.removeEventListener(this.key, this.action);
    }
}