import { assert, Indexer, IDisposable } from "@surface/core";
import { TypeGuard }                    from "@surface/expression";
import { ISubscription }                from "@surface/reactive";
import TemplateDirectiveHandler         from ".";
import
{
    tryEvaluateExpressionByTraceable,
    tryEvaluateKeyExpressionByTraceable,
    tryEvaluatePatternByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable
} from "../../common";
import IPlaceholderDirective from "../../interfaces/directives/placeholder-directive";
import TemplateMetadata      from "../../metadata/template-metadata";
import ParallelWorker        from "../../parallel-worker";
import { Injection, Scope }  from "../../types";

export default class PlaceholderDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly directive:       IPlaceholderDirective;
    private readonly end:             Comment;
    private readonly keySubscription: ISubscription;
    private readonly metadata:        TemplateMetadata;
    private readonly start:           Comment;
    private readonly template:        HTMLTemplateElement;

    private currentDisposable: IDisposable|null   = null;
    private disposed:          boolean            = false;
    private key:               string             = "";
    private subscription:      ISubscription|null = null;
    private timer:             number             = 0;

    private injection?: Injection;

    public constructor(scope: Scope, context: Node, host: Node, template: HTMLTemplateElement, directive: IPlaceholderDirective)
    {
        super(scope, context, host);

        this.template  = template;
        this.directive = directive;
        this.metadata  = TemplateMetadata.from(this.host);
        this.start     = document.createComment("");
        this.end       = document.createComment("");

        assert(template.parentNode);

        const parent = template.parentNode;

        parent.replaceChild(this.end, template);
        parent.insertBefore(this.start, this.end);

        this.keySubscription = tryObserveKeyByObservable(this.scope, directive, { notify: this.onKeyChange.bind(this) }, true);

        this.onKeyChange();
    }

    private applyInjection(): void
    {
        const injection = this.metadata.injections.get(this.key);

        this.inject(injection);
    }

    private applyLazyInjection(): void
    {
        this.timer = window.setTimeout(() => this.applyInjection());
    }

    private inject(injection?: Injection): void
    {
        window.clearTimeout(this.timer);

        this.currentDisposable?.dispose();
        this.currentDisposable = null;

        this.subscription?.unsubscribe();
        this.subscription = null;

        const task = (this.injection = injection)
            ? this.task.bind(this)
            : this.defaultTask.bind(this);

        const notify = async () => await ParallelWorker.run(task);

        this.subscription = tryObserveByObservable(this.scope, this.directive, { notify }, true);

        this.fireAsync(notify);
    }

    private onKeyChange(): void
    {
        if (this.key)
        {
            this.metadata.defaults.delete(this.key);
            this.metadata.placeholders.delete(this.key);
        }

        this.key = `${tryEvaluateKeyExpressionByTraceable(this.scope, this.directive)}`;

        this.metadata.defaults.set(this.key, this.applyLazyInjection.bind(this));
        this.metadata.placeholders.set(this.key, this.inject.bind(this));

        if (this.host.isConnected)
        {
            this.applyInjection();
        }
        else
        {
            this.applyLazyInjection();
        }
    }

    private task(): void
    {
        if (this.disposed)
        {
            return;
        }

        this.currentDisposable?.dispose();

        this.removeInRange(this.start, this.end);

        let destructured = false;

        const { elementScope, scopeAlias } = (destructured = !TypeGuard.isIdentifier(this.injection!.directive.pattern))
            ? { elementScope: tryEvaluatePatternByTraceable(this.scope, tryEvaluateExpressionByTraceable(this.scope, this.directive), this.injection!.directive), scopeAlias: "__scope__" }
            : { elementScope: tryEvaluateExpressionByTraceable(this.scope, this.directive) as Indexer, scopeAlias: this.injection!.directive.pattern.name };

        const mergedScope = destructured
            ? { ...elementScope, ...this.injection!.scope }
            : { [scopeAlias]: elementScope, ...this.injection!.scope };

        const [content, disposable] = this.processTemplate(mergedScope, this.injection!.context, this.injection!.host, this.injection!.template, this.injection!.directive.descriptor);

        this.end.parentNode!.insertBefore(content, this.end);

        this.currentDisposable = disposable;
    }

    private defaultTask(): void
    {
        if (this.disposed)
        {
            return;
        }

        this.currentDisposable?.dispose();

        this.removeInRange(this.start, this.end);

        const [content, disposable] = this.processTemplate(this.scope, this.context, this.host, this.template, this.directive.descriptor);

        this.end.parentNode!.insertBefore(content, this.end);

        this.currentDisposable = disposable;
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.currentDisposable?.dispose();

            this.keySubscription.unsubscribe();
            this.subscription!.unsubscribe();

            this.metadata.defaults.delete(this.key);
            this.metadata.placeholders.delete(this.key);

            this.removeInRange(this.start, this.end);

            this.start.remove();
            this.end.remove();

            this.disposed = true;
        }
    }
}