import { IDisposable }   from "@surface/core";
import { ISubscription } from "@surface/reactive";
import
{
    tryEvaluateExpressionByTraceable,
    tryEvaluateKeyExpressionByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../../common";
import ICustomDirective from "../../interfaces/directives/custom-directive";

export default abstract class DirectiveHandler implements IDisposable
{
    protected readonly directive:       ICustomDirective;
    protected readonly element:         HTMLElement;
    protected readonly scope:           object;
    protected readonly subscription:    ISubscription;
    protected readonly keySubscription: ISubscription;

    protected key!: string;
    protected value: unknown;

    public constructor(scope: object, element: HTMLElement, directive: ICustomDirective)
    {
        this.scope      = scope;
        this.element    = element;
        this.directive  = directive;

        this.onBeforeBind?.();

        this.keySubscription = tryObserveKeyByObservable(scope, directive, { notify: this.keyNotify.bind(this) }, true);
        this.subscription    = tryObserveByObservable(scope, directive,    { notify: this.valueNotify.bind(this) }, true);

        this.keyNotify();
        this.valueNotify();

        this.onAfterBind?.();
    }

    private keyNotify(): void
    {
        const oldKey = this.key;
        const newKey = `${tryEvaluateKeyExpressionByTraceable(this.scope, this.directive)}`;

        this.key = newKey;

        this.onKeyChange?.(newKey, oldKey);
    }

    private valueNotify(): void
    {
        const oldValue = this.value;
        const newValue = tryEvaluateExpressionByTraceable(this.scope, this.directive);

        this.value = newValue;

        this.onValueChange?.(newValue, oldValue);
    }

    protected onAfterBind?(): void;
    protected onAfterUnbind?(): void;
    protected onBeforeBind?(): void;
    protected onBeforeUnbind?(): void;
    protected onKeyChange?(newKey: string, oldKey: string): void;
    protected onValueChange?(newValue: unknown, oldValue: unknown): void;

    public dispose(): void
    {
        this.onBeforeUnbind?.();

        this.keySubscription.unsubscribe();
        this.subscription.unsubscribe();

        this.onAfterUnbind?.();
    }
}