import type { IDisposable }        from "@surface/core";
import { CancellationTokenSource } from "@surface/core";
import type { Subscription }       from "@surface/reactive";
import
{
    tryEvaluateKeyExpressionByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../../common.js";
import type IInjectDirective         from "../../interfaces/inject-directive";
import TemplateMetadata              from "../../metadata/template-metadata.js";
import { scheduler }                 from "../../singletons.js";
import type InjectionContext         from "../../types/injection-context";
import type TemplateDirectiveContext from "../../types/template-directive-context";

export default class InjectDirectiveHandler implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly context:                 TemplateDirectiveContext;
    private readonly directive:               IInjectDirective;
    private readonly keySubscription:         Subscription;
    private readonly metadata:                TemplateMetadata;
    private readonly subscription:            Subscription;
    private readonly template:                HTMLTemplateElement;

    private disposed: boolean = false;
    private key:      string  = "";

    public constructor(template: HTMLTemplateElement, directive: IInjectDirective, context: TemplateDirectiveContext)
    {
        this.template  = template;
        this.directive = directive;
        this.context   = context;
        this.metadata  = TemplateMetadata.from(context.parentNode);

        template.remove();

        const listener = (): void => void scheduler.enqueue(this.task.bind(this), "normal", this.cancellationTokenSource.token);

        this.keySubscription = tryObserveKeyByObservable(context.scope, directive, listener, true);
        this.subscription    = tryObserveByObservable(context.scope, directive,    listener, true);

        this.task();
    }

    private task(): void
    {
        this.disposeCurrentInjection();

        this.key = `${tryEvaluateKeyExpressionByTraceable(this.context.scope, this.directive)}`;

        const injectionContext: InjectionContext =
        {
            directive:  this.directive,
            host:       this.context.host,
            parentNode: this.context.parentNode,
            scope:      this.context.scope,
            template:   this.template,
        };

        this.metadata.injections.set(this.key, injectionContext);

        const action = this.metadata.placeholders.get(this.key);

        if (action)
        {
            action(injectionContext);
        }
    }

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