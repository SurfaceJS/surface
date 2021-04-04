import type { IDisposable }   from "@surface/core";
import { DisposableMetadata } from "@surface/core";
import type { Subscription }  from "@surface/reactive";
import
{
    inheritScope,
    tryEvaluateExpressionByTraceable,
    tryEvaluateKeyExpressionByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../common.js";
import type DirectiveDescriptor from "../types/directive-descriptor";

export default abstract class Directive implements IDisposable
{
    protected readonly descriptor:      DirectiveDescriptor;
    protected readonly element:         HTMLElement;
    protected readonly scope:           object;
    protected readonly subscription:    Subscription;
    protected readonly keySubscription: Subscription;

    protected key!: string;
    protected value: unknown;

    public constructor(scope: object, element: HTMLElement, descriptor: DirectiveDescriptor)
    {
        this.scope      = inheritScope(scope);
        this.element    = element;
        this.descriptor = descriptor;

        this.onBeforeBind?.();

        this.keySubscription = tryObserveKeyByObservable(this.scope, descriptor, this.keyNotify.bind(this), true);
        this.subscription    = tryObserveByObservable(this.scope, descriptor,    this.valueNotify.bind(this), true);

        this.keyNotify();
        this.valueNotify();

        this.onAfterBind?.();
    }

    private keyNotify(): void
    {
        const oldKey = this.key;
        const newKey = `${tryEvaluateKeyExpressionByTraceable(this.scope, this.descriptor)}`;

        this.key = newKey;

        this.onKeyChange?.(newKey, oldKey);
    }

    private valueNotify(): void
    {
        const oldValue = this.value;
        const newValue = tryEvaluateExpressionByTraceable(this.scope, this.descriptor);

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

        DisposableMetadata.from(this.scope).dispose();

        this.onAfterUnbind?.();
    }
}