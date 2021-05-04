import type { IDisposable }  from "@surface/core";
import type { Subscription } from "@surface/observer";
import
{
    tryEvaluateExpressionByTraceable,
    tryEvaluateKeyExpressionByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../common.js";
import type DirectiveContext from "../types/directive-context.js";

export default abstract class Directive implements IDisposable
{
    protected readonly subscription:    Subscription;
    protected readonly keySubscription: Subscription;

    protected key!: string;
    protected value: unknown;

    public constructor(protected readonly context: DirectiveContext)
    {
        this.onBeforeBind?.();

        this.keySubscription = tryObserveKeyByObservable(this.context.scope, this.context.descriptor, this.keyNotify.bind(this), true);
        this.subscription    = tryObserveByObservable(this.context.scope, this.context.descriptor,    this.valueNotify.bind(this), true);

        this.keyNotify();
        this.valueNotify();

        this.onAfterBind?.();
    }

    private keyNotify(): void
    {
        const oldKey = this.key;
        const newKey = `${tryEvaluateKeyExpressionByTraceable(this.context.scope, this.context.descriptor)}`;

        this.key = newKey;

        this.onKeyChange?.(newKey, oldKey);
    }

    private valueNotify(): void
    {
        const oldValue = this.value;
        const newValue = tryEvaluateExpressionByTraceable(this.context.scope, this.context.descriptor);

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