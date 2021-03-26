import type { IDisposable, Indexer }                           from "@surface/core";
import { CancellationTokenSource, DisposableMetadata, assert } from "@surface/core";
import { TypeGuard }                                           from "@surface/expression";
import type { Subscription }                                   from "@surface/reactive";
import
{
    inheritScope,
    tryEvaluateExpressionByTraceable,
    tryEvaluateKeyExpressionByTraceable,
    tryEvaluatePatternByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../../common.js";
import type IPlaceholderDirective    from "../../interfaces/placeholder-directive";
import TemplateMetadata              from "../../metadata/template-metadata.js";
import { scheduler }                 from "../../singletons.js";
import type { Injection }            from "../../types";
import TemplateBlock                 from "../template-block.js";
import TemplateDirectiveHandler      from "./template-directive-handler.js";

export default class PlaceholderDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly directive:               IPlaceholderDirective;
    private readonly keySubscription:         Subscription;
    private readonly metadata:                TemplateMetadata;
    private readonly template:                HTMLTemplateElement;
    private readonly templateBlock:           TemplateBlock           = new TemplateBlock();

    private currentDisposable:                    IDisposable | null      = null;
    private disposed:                             boolean                 = false;
    private key:                                  string                  = "";
    private lazyInjectionCancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private subscription:                         Subscription | null     = null;

    private injection?: Injection;

    public constructor(scope: object, context: Node, host: Node, template: HTMLTemplateElement, directive: IPlaceholderDirective)
    {
        super(inheritScope(scope), context, host);

        this.template  = template;
        this.directive = directive;
        this.metadata  = TemplateMetadata.from(this.host);

        assert(template.parentNode);

        const parent = template.parentNode;

        this.templateBlock.insertAt(parent, template);

        this.keySubscription = tryObserveKeyByObservable(this.scope, directive, this.onKeyChange.bind(this), true);

        this.onKeyChange();
    }

    private applyInjection(): void
    {
        const injection = this.metadata.injections.get(this.key);

        this.inject(injection);
    }

    private applyLazyInjection(): void
    {
        this.lazyInjectionCancellationTokenSource = new CancellationTokenSource();

        void scheduler.enqueue(() => this.applyInjection(), "low", this.lazyInjectionCancellationTokenSource.token);
    }

    private inject(injection?: Injection): void
    {
        this.lazyInjectionCancellationTokenSource.cancel();

        this.currentDisposable?.dispose();
        this.currentDisposable = null;

        this.subscription?.unsubscribe();
        this.subscription = null;

        const task = (this.injection = injection)
            ? this.task.bind(this)
            : this.defaultTask.bind(this);

        const listener = (): void => void scheduler.enqueue(task, "normal", this.cancellationTokenSource.token);

        this.subscription = tryObserveByObservable(this.scope, this.directive, listener, true);

        listener();
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
        this.currentDisposable?.dispose();

        this.templateBlock.clear();

        let destructured = false;

        const { elementScope, scopeAlias } = (destructured = !TypeGuard.isIdentifier(this.injection!.directive.pattern))
            ? { elementScope: tryEvaluatePatternByTraceable(this.scope, tryEvaluateExpressionByTraceable(this.scope, this.directive), this.injection!.directive), scopeAlias: "__scope__" }
            : { elementScope: tryEvaluateExpressionByTraceable(this.scope, this.directive) as Indexer, scopeAlias: this.injection!.directive.pattern.name };

        const mergedScope = destructured
            ? { ...elementScope, ...this.injection!.scope }
            : { [scopeAlias]: elementScope, ...this.injection!.scope };

        const [content, disposable] = this.processTemplate(mergedScope, this.injection!.context, this.injection!.host, this.injection!.template, this.injection!.directive.descriptor);

        this.templateBlock.setContent(content);

        this.currentDisposable = disposable;
    }

    private defaultTask(): void
    {
        this.currentDisposable?.dispose();

        this.templateBlock.clear();

        const [content, disposable] = this.processTemplate(this.scope, this.context, this.host, this.template, this.directive.descriptor);

        this.templateBlock.setContent(content);

        this.currentDisposable = disposable;
    }

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

            this.templateBlock.dispose();

            DisposableMetadata.from(this.scope).dispose();

            this.disposed = true;
        }
    }
}