import { CancellationTokenSource, DisposableMetadata, assert } from "@surface/core";
import type { IDisposable, Subscription }                      from "@surface/core";
import type { ObservablePath, StackTrace }                     from "@surface/htmlx-parser";
import { tryEvaluate, tryEvaluatePattern, tryObserve }         from "../common.js";
import Metadata                                                from "../metadata.js";
import { scheduler }                                           from "../singletons.js";
import type DirectiveEntry                                     from "../types/directive-entry.js";
import type Evaluator                                          from "../types/evaluator.js";
import type InjectionContext                                   from "../types/injection-context.js";
import type NodeFactory                                        from "../types/node-factory.js";
import type Block                                              from "./block.js";

type Context =
{
    block:       Block,
    directives:  Map<string, DirectiveEntry>,
    factory:     NodeFactory,
    host:        Node,
    key:         Evaluator,
    observables: [key: ObservablePath[], value: ObservablePath[]],
    parent:      Node,
    scope:       object,
    value:       Evaluator,
    source?:     { key: string, scope: string },
    stackTrace?: StackTrace,
};
export default class PlaceholderDirective implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly keySubscription:         Subscription;
    private readonly metadata:                Metadata;

    private currentDisposable:                    IDisposable | null      = null;
    private disposed:                             boolean                 = false;
    private key:                                  string                  = "";
    private lazyInjectionCancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private subscription:                         Subscription | null     = null;

    private injectionContext?: InjectionContext;

    public constructor(private readonly context: Context)
    {
        this.metadata = Metadata.from(context.host);

        this.keySubscription = tryObserve(context.scope, context.observables[0], this.onKeyChange, true, context.source?.key, context.stackTrace);

        this.onKeyChange();
    }

    private readonly applyInjection = (): void =>
    {
        const injection = this.metadata.injections.get(this.key);

        this.inject(injection);
    };

    private readonly applyLazyInjection = (): void =>
    {
        this.lazyInjectionCancellationTokenSource = new CancellationTokenSource();

        void scheduler.enqueue(this.applyInjection, "low", this.lazyInjectionCancellationTokenSource.token);
    };

    private readonly inject = (injectionContext?: InjectionContext): void =>
    {
        this.lazyInjectionCancellationTokenSource.cancel();

        this.currentDisposable?.dispose();
        this.currentDisposable = null;

        this.subscription?.unsubscribe();
        this.subscription = null;

        const task = (this.injectionContext = injectionContext)
            ? this.task
            : this.defaultTask;

        const listener = (): void => void scheduler.enqueue(task, "normal", this.cancellationTokenSource.token);

        this.subscription = tryObserve(this.context.scope, this.context.observables[1], listener, true, this.context.source?.scope, this.context.stackTrace);

        listener();
    };

    private readonly onKeyChange = (): void =>
    {
        if (this.key)
        {
            this.metadata.defaults.delete(this.key);
            this.metadata.placeholders.delete(this.key);
        }

        this.key = String(tryEvaluate(this.context.scope, this.context.key, this.context.source?.key, this.context.stackTrace));

        this.metadata.defaults.set(this.key, this.applyLazyInjection);
        this.metadata.placeholders.set(this.key, this.inject);

        this.applyLazyInjection();
    };

    private readonly task = (): void =>
    {
        assert(this.injectionContext);

        this.currentDisposable?.dispose();

        this.context.block.clear();

        const value          = tryEvaluate(this.context.scope, this.context.value, this.context.source?.scope, this.context.stackTrace);
        const directiveScope = tryEvaluatePattern(this.context.scope, this.injectionContext.value, value, this.injectionContext.source, this.injectionContext.stackTrace);
        const scope          = { ...this.injectionContext.scope, ...directiveScope };

        const [content, activator] = this.injectionContext.factory();

        this.context.block.setContent(content);

        const disposables = [activator(this.injectionContext.parent, this.injectionContext.host, scope, this.injectionContext.directives), DisposableMetadata.from(scope)];

        this.currentDisposable = { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
    };

    private readonly defaultTask = (): void =>
    {
        this.currentDisposable?.dispose();

        this.context.block.clear();

        const [content, activator] = this.context.factory();

        this.context.block.setContent(content);

        this.currentDisposable = activator(this.context.parent, this.context.host, this.context.scope, this.context.directives);
    };

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.cancellationTokenSource.cancel();
            this.currentDisposable?.dispose();

            this.keySubscription.unsubscribe();
            this.subscription?.unsubscribe();

            this.metadata.defaults.delete(this.key);
            this.metadata.placeholders.delete(this.key);

            this.context.block.dispose();

            this.disposed = true;
        }
    }
}
