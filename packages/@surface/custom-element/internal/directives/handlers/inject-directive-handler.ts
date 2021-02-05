import { CancellationTokenSource, DisposableMetadata } from "@surface/core";
import type { Subscription }                           from "@surface/reactive";
import
{
    inheritScope,
    tryEvaluateKeyExpressionByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../../common.js";
import type IInjectDirective    from "../../interfaces/inject-directive";
import TemplateMetadata         from "../../metadata/template-metadata.js";
import { scheduler }            from "../../singletons.js";
import TemplateDirectiveHandler from "./template-directive-handler.js";

export default class InjectDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly directive:               IInjectDirective;
    private readonly keySubscription:         Subscription;
    private readonly metadata:                TemplateMetadata;
    private readonly subscription:            Subscription;
    private readonly template:                HTMLTemplateElement;

    private disposed: boolean = false;
    private key:      string  = "";

    public constructor(scope: object, context: Node, host: Node, template: HTMLTemplateElement, directive: IInjectDirective)
    {
        super(inheritScope(scope), context, host);

        this.template  = template;
        this.directive = directive;
        this.metadata  = TemplateMetadata.from(context);

        template.remove();

        const listener = (): void => void scheduler.enqueue(this.task.bind(this), "normal", this.cancellationTokenSource.token);

        this.keySubscription = tryObserveKeyByObservable(this.scope, directive, listener, true);
        this.subscription    = tryObserveByObservable(this.scope, directive,    listener, true);

        this.task();
    }

    private task(): void
    {
        this.disposeCurrentInjection();

        this.key = `${tryEvaluateKeyExpressionByTraceable(this.scope, this.directive)}`;

        this.metadata.injections.set(this.key, { context: this.context, directive: this.directive, host: this.host, scope: this.scope, template: this.template });

        const action = this.metadata.placeholders.get(this.key);

        if (action)
        {
            action({ context: this.context, directive: this.directive, host: this.host, scope: this.scope, template: this.template });
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

            DisposableMetadata.from(this.scope).dispose();

            this.disposed = true;
        }
    }
}