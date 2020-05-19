import { IDisposable }                       from "@surface/core";
import { ISubscription }                     from "@surface/reactive";
import { tryEvaluateExpression, tryObserve } from "../../common";
import IDirective                            from "../../interfaces/directive";
import { Scope }                             from "../../types";

export default abstract class DirectiveHandler implements IDisposable
{
    protected readonly directive:     IDirective;
    protected readonly element:       Element;
    protected readonly scope:         Scope;
    protected readonly subscriptions: Array<ISubscription> = [];

    protected key!: string;
    protected value: unknown;

    public constructor(scope: Scope, element: Element, directive: IDirective)
    {
        this.scope      = scope;
        this.element    = element;
        this.directive  = directive;

        this.onBeforeBind?.();

        this.subscriptions.push(tryObserve(scope, directive.keyObservables, { notify: this.keyNotify.bind(this) },   directive.rawKeyExpression, directive.stackTrace, true));
        this.subscriptions.push(tryObserve(scope, directive.observables,    { notify: this.valueNotify.bind(this) }, directive.rawExpression,    directive.stackTrace, true));

        this.keyNotify();
        this.valueNotify();

        this.onAfterBind?.();
    }

    private keyNotify(): void
    {
        const oldKey = this.key;
        const newKey = `${tryEvaluateExpression(this.scope, this.directive.keyExpression, this.directive.rawKeyExpression, this.directive.stackTrace)}`;

        this.key = newKey;

        this.onKeyChange?.(oldKey, newKey);
    }

    private valueNotify(): void
    {
        const oldValue = this.value;
        const newValue = tryEvaluateExpression(this.scope, this.directive.expression, this.directive.rawExpression, this.directive.stackTrace);

        this.value = newValue;

        this.onValueChange?.(oldValue, newValue);
    }

    protected onAfterBind?(): void;
    protected onAfterUnbind?(): void;
    protected onBeforeBind?(): void;
    protected onBeforeUnbind?(): void;
    protected onKeyChange?(oldKey: string, newKey: string): void;
    protected onValueChange?(oldValue: unknown, newValue: unknown): void;

    public dispose(): void
    {
        this.onBeforeUnbind?.();

        this.subscriptions.forEach(x => x.unsubscribe());

        this.onAfterUnbind?.();
    }
}