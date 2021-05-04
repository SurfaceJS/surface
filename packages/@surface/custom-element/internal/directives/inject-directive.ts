import type { IDisposable }        from "@surface/core";
import { CancellationTokenSource } from "@surface/core";
import type { Subscription }       from "@surface/observer";
import
{
    tryEvaluateKeyExpressionByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../common.js";
import TemplateMetadata               from "../metadata/template-metadata.js";
import { scheduler }                  from "../singletons.js";
import type InjectDirectiveDescriptor from "../types/inject-directive-descriptor";
import type InjectionContext          from "../types/injection-context";
import type TemplateDirectiveContext  from "../types/template-directive-context";

export default class InjectDirective implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly context:                 TemplateDirectiveContext;
    private readonly descriptor:              InjectDirectiveDescriptor;
    private readonly keySubscription:         Subscription;
    private readonly metadata:                TemplateMetadata;
    private readonly subscription:            Subscription;
    private readonly template:                HTMLTemplateElement;

    private disposed: boolean = false;
    private key:      string  = "";

    public constructor(template: HTMLTemplateElement, descriptor: InjectDirectiveDescriptor, context: TemplateDirectiveContext)
    {
        this.template   = template;
        this.descriptor = descriptor;
        this.context    = context;
        this.metadata   = TemplateMetadata.from(context.parentNode);

        template.remove();

        const listener = (): void => void scheduler.enqueue(this.task, "normal", this.cancellationTokenSource.token);

        this.keySubscription = tryObserveKeyByObservable(context.scope, descriptor, listener, true);
        this.subscription    = tryObserveByObservable(context.scope, descriptor,    listener, true);

        this.task();
    }

    private readonly task = (): void =>
    {
        this.disposeCurrentInjection();

        this.key = `${tryEvaluateKeyExpressionByTraceable(this.context.scope, this.descriptor)}`;

        const injectionContext: InjectionContext =
        {
            customDirectives: this.context.customDirectives,
            descriptor:       this.descriptor,
            host:             this.context.host,
            parentNode:       this.context.parentNode,
            scope:            this.context.scope,
            template:         this.template,
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