import { CancellationTokenSource, DisposableMetadata, assert } from "@surface/core";
import type { IDisposable, Subscription }                      from "@surface/core";
import { scheduler }                                           from "../../singletons.js";
import type { DirectiveEntry }                                 from "../../types/index";
import type Block                                              from "../block.js";
import TemplateMetadata                                        from "../metadata/template-metadata.js";
import observe                                                 from "../observe.js";
import type Expression                                         from "../types/expression.js";
import type Factory                                            from "../types/fatctory.js";
import type InjectionContext                                   from "../types/injection-context.js";
import type ObservablePath                                     from "../types/observable-path.js";

type Context =
{
    block:       Block,
    directives:  Map<string, DirectiveEntry>,
    factory:     Factory,
    host:        Node,
    key:         Expression<string>,
    observables: [key: ObservablePath[], value: ObservablePath[]],
    parent:      Node,
    scope:       object,
    value:       Expression,
};
export default class PlaceholdeStatement implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly keySubscription:         Subscription;
    private readonly metadata:                TemplateMetadata;

    private currentDisposable:                    IDisposable | null      = null;
    private disposed:                             boolean                 = false;
    private key:                                  string                  = "";
    private lazyInjectionCancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private subscription:                         Subscription | null     = null;

    private injectionContext?: InjectionContext;

    public constructor(private readonly context: Context)
    {
        this.metadata = TemplateMetadata.from(context.host);

        this.keySubscription = observe(context.scope, context.observables[0], this.onKeyChange, true);

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

    private readonly inject = (injection?: InjectionContext): void =>
    {
        this.lazyInjectionCancellationTokenSource.cancel();

        this.currentDisposable?.dispose();
        this.currentDisposable = null;

        this.subscription?.unsubscribe();
        this.subscription = null;

        const task = (this.injectionContext = injection)
            ? this.task
            : this.defaultTask;

        const listener = (): void => void scheduler.enqueue(task, "normal", this.cancellationTokenSource.token);

        this.subscription = observe(this.context.scope, this.context.observables[1], listener, true);

        listener();
    };

    private readonly onKeyChange = (): void =>
    {
        if (this.key)
        {
            this.metadata.defaults.delete(this.key);
            this.metadata.placeholders.delete(this.key);
        }

        this.key = this.context.key(this.context.scope);

        this.metadata.defaults.set(this.key, this.applyLazyInjection);
        this.metadata.placeholders.set(this.key, this.inject);

        if (this.context.host.isConnected)
        {
            this.applyInjection();
        }
        else
        {
            this.applyLazyInjection();
        }
    };

    private readonly task = (): void =>
    {
        assert(this.injectionContext);

        this.currentDisposable?.dispose();

        this.context.block.clear();

        const value          = this.context.value(this.context.scope);
        const directiveScope = this.injectionContext.pattern(this.context.scope, value);
        const scope          = { ...this.injectionContext.scope, ...directiveScope };

        const [content, activator] = this.injectionContext.factory();

        this.context.block.setContent(content);

        const disposables = [activator(this.context.parent, this.context.host, scope, new Map()), DisposableMetadata.from(scope)];

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
            this.subscription!.unsubscribe();

            this.metadata.defaults.delete(this.key);
            this.metadata.placeholders.delete(this.key);

            this.context.block.dispose();

            this.disposed = true;
        }
    }
}
