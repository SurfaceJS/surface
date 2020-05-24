import { ISubscription }        from "@surface/reactive";
import TemplateDirectiveHandler from ".";
import
{
    tryEvaluateKeyExpressionByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable
} from "../../common";
import IInjectDirective from "../../interfaces/directives/inject-directive";
import TemplateMetadata from "../../metadata/template-metadata";
import { Scope }        from "../../types";

export default class InjectDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly directive:       IInjectDirective;
    private readonly keySubscription: ISubscription;
    private readonly metadata:        TemplateMetadata;
    private readonly subscription:    ISubscription;
    private readonly template:        HTMLTemplateElement;

    private disposed: boolean = false;
    private key:      string  = "";

    public constructor(scope: Scope, context: Node, host: Node, template: HTMLTemplateElement, directive: IInjectDirective)
    {
        super(scope, context, host);

        this.template  = template;
        this.directive = directive;
        this.metadata  = TemplateMetadata.from(context);

        template.remove();

        this.keySubscription = tryObserveKeyByObservable(scope, directive, { notify: this.task.bind(this) }, true);
        this.subscription    = tryObserveByObservable(scope, directive,    { notify: this.task.bind(this) }, true);

        this.task();
    }

    private task(): void
    {
        if (this.disposed)
        {
            return;
        }

        this.disposeCurrentInjection();

        this.key = `${tryEvaluateKeyExpressionByTraceable(this.scope, this.directive)}`;

        this.metadata.injections.set(this.key, { scope: this.scope, template: this.template, directive: this.directive, context: this.context, host: this.host });

        const action = this.metadata.placeholders.get(this.key);

        if (action)
        {
            action(this.scope, this.context, this.host, this.template, this.directive);
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
            this.disposeCurrentInjection();

            this.keySubscription.unsubscribe();
            this.subscription.unsubscribe();

            this.disposed = true;
        }
    }
}