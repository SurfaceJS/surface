import IDisposable               from "@surface/core/interfaces/disposable";
import ISubscription             from "@surface/reactive/interfaces/subscription";
import { tryEvaluateExpression } from "../../common";
import DataBind                  from "../../data-bind";
import IDirective                from "../../interfaces/directive";
import { Scope }                 from "../../types";

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

        this.subscriptions.push(DataBind.observe(scope, directive.keyObservables,   { notify: this.keyNotify.bind(this) },   true));
        this.subscriptions.push(DataBind.observe(scope, directive.valueObservables, { notify: this.valueNotify.bind(this) }, true));

        this.keyNotify();
        this.valueNotify();

        this.onAfterBind?.();
    }

    private keyNotify(): void
    {
        const oldKey = this.key;
        const newKey = `${tryEvaluateExpression(this.scope, this.directive.key, this.directive.stackTrace)}`;

        this.key = newKey;

        this.onKeyChange?.(oldKey, newKey);
    }

    private valueNotify(): void
    {
        const oldValue = this.value;
        const newValue = tryEvaluateExpression(this.scope, this.directive.value, this.directive.stackTrace);

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