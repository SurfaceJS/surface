import type { IDisposable, Subscription } from "@surface/core";
import { tryEvaluate, tryObserve }        from "../common.js";
import type DirectiveContext              from "../types/directive-context.js";

export default abstract class Directive implements IDisposable
{
    protected readonly subscription: Subscription;

    protected value: unknown;

    public constructor(protected readonly context: DirectiveContext)
    {
        this.onBeforeBind?.();

        this.subscription = tryObserve(this.context.scope, this.context.observables, this.valueNotify.bind(this), true, this.context.source, this.context.stackTrace);

        this.valueNotify();

        this.onAfterBind?.();
    }

    private valueNotify(): void
    {
        const oldValue = this.value;
        const newValue = tryEvaluate(this.context.scope, this.context.value, this.context.source, this.context.stackTrace);

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

        this.subscription.unsubscribe();

        this.onAfterUnbind?.();
    }
}
