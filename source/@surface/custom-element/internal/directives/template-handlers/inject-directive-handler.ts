import { CancellationTokenSource } from "@surface/core";
import
{
    tryEvaluateKeyExpressionByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../../common";
import IInjectDirective         from "../../interfaces/inject-directive";
import ISubscription            from "../../interfaces/subscription";
import TemplateMetadata         from "../../metadata/template-metadata";
import { scheduler }            from "../../workers";
import TemplateDirectiveHandler from ".";

export default class InjectDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly directive:               IInjectDirective;
    private readonly keySubscription:         ISubscription;
    private readonly metadata:                TemplateMetadata;
    private readonly subscription:            ISubscription;
    private readonly template:                HTMLTemplateElement;

    private disposed: boolean = false;
    private key:      string  = "";

    public constructor(scope: object, context: Node, host: Node, template: HTMLTemplateElement, directive: IInjectDirective)
    {
        super(scope, context, host);

        this.template  = template;
        this.directive = directive;
        this.metadata  = TemplateMetadata.from(context);

        template.remove();

        const listener = (): void => scheduler.enqueue(this.task.bind(this), "normal", this.cancellationTokenSource.token);

        this.keySubscription = tryObserveKeyByObservable(scope, directive, listener, true);
        this.subscription    = tryObserveByObservable(scope, directive,    listener, true);

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

            this.disposed = true;
        }
    }
}