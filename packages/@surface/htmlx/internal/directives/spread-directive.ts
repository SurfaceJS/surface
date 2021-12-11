/* eslint-disable @typescript-eslint/indent */
import { CancellationTokenSource }                               from "@surface/core";
import type { IDisposable, Subscription }                        from "@surface/core";
import type { ObservablePath, StackTrace }                       from "@surface/htmlx-parser";
import { throwTemplateEvaluationError, tryEvaluate, tryObserve } from "../common.js";
import { scheduler }                                             from "../singletons.js";
import type Evaluator                                            from "../types/evaluator.js";
import type SpreadFactory                                        from "../types/spread-factory.js";

export type Context =
{
    element:     HTMLElement,
    evaluator:   Evaluator,
    scope:       object,
    factories:   SpreadFactory[],
    observables: ObservablePath[],
    source?:     string,
    stackTrace?: StackTrace,
};

export default class SpreadDirective implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly disposables:             IDisposable[] = [];
    private readonly subscription:            Subscription;

    private disposed: boolean = false;
    private source?: HTMLElement;

    public constructor(private readonly context: Context)
    {
        const listener = (): void => void scheduler.enqueue(this.task, "low", this.cancellationTokenSource.token);

        this.subscription = tryObserve(context.scope, context.observables, listener, true, context.source, context.stackTrace);

        listener();
    }

    private readonly task = (): void =>
    {
        const source = tryEvaluate(this.context.scope, this.context.evaluator, this.context.source, this.context.stackTrace);

        /* c8 ignore next 4 */
        if (this.source == source)
        {
            return;
        }

        if (!(source instanceof HTMLElement))
        {
            const message = `Expression '${this.context.source}' don't results in a valid HTMLElement`;

            if (this.context.source && this.context.stackTrace)
            {
                throwTemplateEvaluationError(message, this.context.stackTrace);
            }  /* c8 ignore next 3 */

            throw new Error(message);
        }

        this.disposables.splice(0).forEach(x => x.dispose());

        for (const factory of this.context.factories)
        {
            this.disposables.push(factory(source, this.context.element));
        }

        this.source = source;
    };

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.cancellationTokenSource.cancel();
            this.disposables.splice(0).forEach(x => x.dispose());
            this.subscription.unsubscribe();

            this.disposed = true;
        }
    }
}

