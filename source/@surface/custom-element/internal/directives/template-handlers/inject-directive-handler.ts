import { IDisposable }                                  from "@surface/core";
import { ISubscription }                                from "@surface/reactive";
import TemplateDirectiveHandler                         from ".";
import { tryEvaluateExpression, tryObserveByDirective } from "../../common";
import IInjectDirective                                 from "../../interfaces/directives/inject-directive";
import TemplateMetadata                                 from "../../metadata/template-metadata";
import { Scope }                                        from "../../types";

export default class InjectDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly directive: IInjectDirective;
    private readonly metadata:  TemplateMetadata;
    private readonly template:  HTMLTemplateElement;

    private currentDisposable: IDisposable|null   = null;
    private disposed:          boolean            = false;
    private key:               string;
    private subscription:      ISubscription|null = null;

    public constructor(scope: Scope, context: Node, host: Node, template: HTMLTemplateElement, directive: IInjectDirective)
    {
        super(scope, context, host);

        this.template  = template;
        this.directive = directive;
        this.metadata  = TemplateMetadata.from(context);
        this.key       = `${directive.keyExpression.evaluate(scope)}`;

        const notify = this.task.bind(this);

        this.subscription = tryObserveByDirective(scope, directive, { notify }, true);

        notify();

        template.remove();
    }

    private task(): void
    {
        this.currentDisposable?.dispose();

        this.key = `${tryEvaluateExpression(this.scope, this.directive.keyExpression, this.directive.rawKeyExpression, this.directive.stackTrace)}`;

        const action = this.metadata.injectors.get(this.key);

        if (action)
        {
            action(this.scope, this.context, this.host, this.template, this.directive);
        }
        else
        {
            this.metadata.injections.set(this.key, { scope: this.scope, template: this.template, directive: this.directive, context: this.context, host: this.host });
        }

        this.currentDisposable = { dispose: () => (this.metadata.injections.delete(this.key), this.metadata.defaults.get(this.key)?.()) };
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.currentDisposable?.dispose();

            this.subscription!.unsubscribe();

            this.disposed = true;
        }
    }
}