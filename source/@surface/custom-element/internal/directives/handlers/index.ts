import { Action }    from "@surface/core";
import IDisposable   from "@surface/core/interfaces/disposable";
import ISubscription from "@surface/reactive/interfaces/subscription";
import DataBind      from "../../data-bind";
import IDirective    from "../../interfaces/directive";
import { Scope }     from "../../types";

export default abstract class DirectiveHandler implements IDisposable
{
    protected readonly directive:     IDirective;
    protected readonly element:       Element;
    protected readonly scope:         Scope;
    protected readonly subscriptions: Array<ISubscription> = [];

    protected onAfterBind?: Action;
    protected onAfterUnbind?: Action;
    protected onBeforeBind?: Action;
    protected onBeforeUnbind?: Action;

    public constructor(scope: Scope, element: Element, directive: IDirective)
    {
        this.scope      = scope;
        this.element    = element;
        this.directive  = directive;

        this.onBeforeBind?.();

        this.subscriptions.push(DataBind.observe(scope, directive.keyObservables,   { notify: () => this.keyHandler(`${directive.key.evaluate(scope)}`) }));
        this.subscriptions.push(DataBind.observe(scope, directive.valueObservables, { notify: () => this.valueHandler(directive.value.evaluate(scope)) }));

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