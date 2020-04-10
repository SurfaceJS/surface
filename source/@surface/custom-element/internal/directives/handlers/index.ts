import { Action }      from "@surface/core";
import IDisposable     from "@surface/core/interfaces/disposable";
import IExpression     from "@surface/expression/interfaces/expression";
import ISubscription   from "@surface/reactive/interfaces/subscription";
import ObserverVisitor from "../../observer-visitor";
import { Scope }       from "../../types";

export default abstract class DirectiveHandler implements IDisposable
{
    protected readonly element:       Element;
    protected readonly expression:    IExpression;
    protected readonly key:           IExpression;
    protected readonly scope:         Scope;
    protected readonly subscriptions: Array<ISubscription> = [];

    protected onAfterBind?: Action;
    protected onAfterUnbind?: Action;
    protected onBeforeBind?: Action;
    protected onBeforeUnbind?: Action;

    public constructor(scope: Scope, element: Element, key: IExpression, expression: IExpression)
    {
        this.scope      = scope;
        this.element    = element;
        this.key        = key;
        this.expression = expression;

        this.onBeforeBind?.();

        this.subscriptions.push(ObserverVisitor.observe(scope, expression, { notify: () => this.keyHandler(`${key.evaluate(scope)}`) }, false));
        this.subscriptions.push(ObserverVisitor.observe(scope, key,        { notify: () => this.valueHandler(expression.evaluate(scope)) }, false));

        this.onAfterBind?.();
    }

    protected abstract keyHandler(value: string): void;

    protected abstract valueHandler(value: unknown): void;

    public dispose(): void
    {
        this.onBeforeUnbind?.();

        this.subscriptions.forEach(x => x.unsubscribe());

        this.onAfterUnbind?.();
    }
}