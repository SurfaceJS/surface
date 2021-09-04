import { CancellationTokenSource }        from "@surface/core";
import type { IDisposable, Subscription } from "@surface/core";
import { scheduler }                      from "../../singletons.js";
import type { DirectiveEntry }            from "../../types/index.js";
import type Block                         from "../block.js";
import TemplateMetadata                   from "../metadata/template-metadata.js";
import observe                            from "../observe.js";
import type DestructuredEvaluator                       from "../types/destructured-evaluator.js";
import type Evaluator                    from "../types/evaluator.js";
import type InjectionContext              from "../types/injection-context.js";
import type NodeFactory                       from "../types/node-fatctory";
import type ObservablePath                from "../types/observable-path.js";

type Context =
{
    block:       Block,
    directives:  Map<string, DirectiveEntry>,
    factory:     NodeFactory,
    host:        Node,
    key:         Evaluator<string>,
    observables: [key: ObservablePath[], value: ObservablePath[]],
    parent:      Node,
    scope:       object,
    value:       DestructuredEvaluator,
};

export default class InjectStatement implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly keySubscription:         Subscription;
    private readonly metadata:                TemplateMetadata;
    private readonly subscription:            Subscription;

    private disposed: boolean = false;
    private key:      string  = "";

    public constructor(private readonly context: Context)
    {
        this.metadata = TemplateMetadata.from(context.parent);

        const listener = (): void => void scheduler.enqueue(this.task, "normal", this.cancellationTokenSource.token);

        this.keySubscription = observe(context.scope, context.observables[0], listener, true);
        this.subscription    = observe(context.scope, context.observables[1], listener, true);

        this.task();
    }

    private readonly task = (): void =>
    {
        this.disposeCurrentInjection();

        this.key = this.context.key(this.context.scope);

        const injectionContext: InjectionContext =
        {
            directives: this.context.directives,
            factory:    this.context.factory,
            host:       this.context.host,
            parent:     this.context.parent,
            scope:      this.context.scope,
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
