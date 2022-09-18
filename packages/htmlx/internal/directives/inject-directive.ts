import { CancellationTokenSource }         from "@surface/core";
import type { IDisposable, Subscription }  from "@surface/core";
import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import { tryEvaluate, tryObserve }         from "../common.js";
import Metadata                            from "../metadata.js";
import { scheduler }                       from "../singletons.js";
import type DestructuredEvaluator          from "../types/destructured-evaluator.js";
import type DirectiveEntry                 from "../types/directive-entry.js";
import type Evaluator                      from "../types/evaluator.js";
import type InjectionContext               from "../types/injection-context.js";
import type NodeFactory                    from "../types/node-factory.js";
import type Block                          from "./block.js";

export type Context =
{
    block:       Block,
    directives:  Map<string, DirectiveEntry>,
    factory:     NodeFactory,
    host:        Node,
    key:         Evaluator,
    observables: [key: ObservablePath[], value: ObservablePath[]],
    parent:      Node,
    scope:       object,
    value:       DestructuredEvaluator,
    source?:     { key: string, scope: string },
    stackTrace?: StackTrace,
};

export default class InjectDirective implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly keySubscription:         Subscription;
    private readonly metadata:                Metadata;
    private readonly subscription:            Subscription;

    private disposed: boolean = false;
    private key:      string  = "";

    public constructor(private readonly context: Context)
    {
        this.metadata = Metadata.from(context.parent);

        const listener = (): void => void scheduler.enqueue(this.task, "normal", this.cancellationTokenSource.token);

        this.keySubscription = tryObserve(context.scope, context.observables[0], listener, true, context.source?.key, context.stackTrace);
        this.subscription    = tryObserve(context.scope, context.observables[1], listener, true, context.source?.scope, context.stackTrace);

        listener();
    }

    private readonly task = (): void =>
    {
        this.disposeCurrentInjection();

        this.key = String(tryEvaluate(this.context.scope, this.context.key, this.context.source?.key, this.context.stackTrace));

        const injectionContext: InjectionContext =
        {
            directives: this.context.directives,
            factory:    this.context.factory,
            host:       this.context.host,
            parent:     this.context.parent,
            scope:      this.context.scope,
            source:     this.context.source?.scope,
            stackTrace: this.context.stackTrace,
            value:      this.context.value,
        };

        this.metadata.injections.set(this.key, injectionContext);

        const action = this.metadata.placeholders.get(this.key);

        if (action)
        {
            action(injectionContext);
        }
    };

    private disposeCurrentInjection(): void
    {
        if (this.key)
        {
            this.metadata.injections.delete(this.key);
            this.metadata.defaults.get(this.key)?.();
        }
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.cancellationTokenSource.cancel();
            this.disposeCurrentInjection();

            this.keySubscription.unsubscribe();
            this.subscription.unsubscribe();

            this.disposed = true;
        }
    }
}
