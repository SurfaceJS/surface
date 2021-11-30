/* eslint-disable @typescript-eslint/indent */
import { CancellationTokenSource, hasFlag }                                                             from "@surface/core";
import type { IDisposable, Subscription }                                                               from "@surface/core";
import type { ObservablePath, StackTrace }                                                              from "@surface/htmlx-parser";
import { MetadataFlags }                                                                                from "@surface/htmlx-parser";
import eventListener, { onewaybind, throwTemplateEvaluationError, tryEvaluate, tryObserve, twowaybind } from "../common.js";
import Metadata                                                                                         from "../metadata.js";
import { scheduler }                                                                                    from "../singletons.js";
import type Evaluator                                                                                   from "../types/evaluator.js";

export type Context =
{
    element:     HTMLElement,
    evaluator:   Evaluator,
    scope:       object,
    flags:       MetadataFlags,
    observables: ObservablePath[],
    source?:     string,
    stackTrace?: StackTrace,
};

export default class SpreadDirective implements IDisposable
{
    private readonly cancellationTokenSource:  CancellationTokenSource = new CancellationTokenSource();
    private readonly disposables:              IDisposable[] = [];
    private readonly subscription:             Subscription;

    private disposed: boolean = false;
    private target?: HTMLElement;

    public constructor(private readonly context: Context)
    {
        const listener = (): void => void scheduler.enqueue(this.task, "low", this.cancellationTokenSource.token);

        this.subscription = tryObserve(context.scope, context.observables, listener, true, context.source, context.stackTrace);

        listener();
    }

    private readonly task = (): void =>
    {
        const target = tryEvaluate(this.context.scope, this.context.evaluator, this.context.source, this.context.stackTrace);

        if (this.target == target)
        {
            return;
        }

        if (!(target instanceof HTMLElement))
        {
            const message = `Expression '${this.context.source}' don't results in a valid HTMLElement`;

            if (this.context.source && this.context.stackTrace)
            {
                throwTemplateEvaluationError(message, this.context.stackTrace);
            }

            throw new Error(message);
        }

        const metadata = Metadata.from(target);

        this.disposables.splice(0).forEach(x => x.dispose());

        if (hasFlag(this.context.flags, MetadataFlags.Attributes))
        {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let index = 0; index < target.attributes.length; index++)
            {
                const attribute = target.attributes[index];

                this.context.element.setAttribute(attribute.name, attribute.value);
            }

            const callback: MutationCallback = records =>
            {
                const action = (): void =>
                {
                    for (const record of records)
                    {
                        const value = target.getAttribute(record.attributeName!);

                        if (value === null)
                        {
                            this.context.element.removeAttribute(record.attributeName!);
                        }
                        else
                        {
                            this.context.element.setAttribute(record.attributeName!, value);
                        }
                    }
                };

                void scheduler.enqueue(action, "high");
            };

            const observer = new MutationObserver(callback);

            observer.observe(target, { attributes: true });

            this.disposables.push({ dispose: () => observer.disconnect() });
        }

        if (hasFlag(this.context.flags, MetadataFlags.Binds))
        {
            for (const entry of metadata.context.binds.oneway.values())
            {
                this.disposables.push(onewaybind(this.context.element, entry.scope, entry.key, entry.evaluator, entry.observables));
            }

            for (const entry of metadata.context.binds.twoway.values())
            {
                this.disposables.push(twowaybind(this.context.element, entry.scope, entry.left, entry.right));
            }
        }

        if (hasFlag(this.context.flags, MetadataFlags.Listeners))
        {
            for (const entry of metadata.context.listeners.values())
            {
                this.disposables.push(eventListener(this.context.element, entry.scope, entry.type, entry.listenerEvaluator, entry.contextEvaluator));
            }
        }

        this.target = target;
    };

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.cancellationTokenSource.cancel();
            this.subscription.unsubscribe();
            this.disposables.splice(0).forEach(x => x.dispose());
            this.disposed = true;
        }
    }
}

