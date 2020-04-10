import { Action1 }     from "@surface/core";
import IDisposable     from "@surface/core/interfaces/disposable";
import Expression      from "@surface/expression";
import IExpression     from "@surface/expression/interfaces/expression";
import ISubscription   from "@surface/reactive/interfaces/subscription";
import ObserverVisitor from "../../observer-visitor";
import { Scope }       from "../../types";

export default class EventDirectiveHandler implements IDisposable
{
    private readonly action:       Action1<Event>;
    private readonly element:      Element;
    private readonly subscription: ISubscription;

    private key: string = "";

    public constructor(scope: Scope, element: Element, key: IExpression, expression: IExpression)
    {
        this.element = element;
        this.action  = this.evaluate(scope, expression);

        const notify = () => this.keyHandler(`${key.evaluate(scope)}`);

        this.subscription = ObserverVisitor.observe(scope, key, { notify }, false);

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
        if (Expression.TypeGuard.isArrowFunctionExpression(expression) || Expression.TypeGuard.isIdentifier(expression))
        {
            return expression.evaluate(scope) as Action1<Event>;
        }
        else if (Expression.TypeGuard.isMemberExpression(expression))
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