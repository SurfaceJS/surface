import type { IDisposable, Indexer }       from "@surface/core";
import { CancellationTokenSource, assert } from "@surface/core";
import { TypeGuard }                       from "@surface/expression";
import type { Subscription }               from "@surface/reactive";
import
{
    tryEvaluateExpressionByTraceable,
    tryEvaluateKeyExpressionByTraceable,
    tryEvaluatePatternByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../../common.js";
import type IPlaceholderDirective    from "../../interfaces/placeholder-directive";
import TemplateMetadata              from "../../metadata/template-metadata.js";
import TemplateProcessor             from "../../processors/template-processor.js";
import { scheduler }                 from "../../singletons.js";
import type InjectionContext         from "../../types/injection-context";
import type TemplateDirectiveContext from "../../types/template-directive-context.js";
import type TemplateProcessorContext from "../../types/template-processor-context.js";
import TemplateBlock                 from "../template-block.js";

export default class PlaceholderDirectiveHandler implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly context:                 TemplateDirectiveContext;
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

    private injectionContext?: InjectionContext;

    public constructor(template: HTMLTemplateElement, directive: IPlaceholderDirective, context: TemplateDirectiveContext)
    {
        this.template  = template;
        this.directive = directive;
        this.context   = context;
        this.metadata  = TemplateMetadata.from(context.host);

        assert(template.parentNode);

        const parent = template.parentNode;

        this.templateBlock.insertAt(parent, template);

        this.keySubscription = tryObserveKeyByObservable(context.scope, directive, this.onKeyChange.bind(this), true);

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

    private inject(injection?: InjectionContext): void
    {
        this.lazyInjectionCancellationTokenSource.cancel();

        this.currentDisposable?.dispose();
        this.currentDisposable = null;

        this.subscription?.unsubscribe();
        this.subscription = null;

        const task = (this.injectionContext = injection)
            ? this.task.bind(this)
            : this.defaultTask.bind(this);

        const listener = (): void => void scheduler.enqueue(task, "normal", this.cancellationTokenSource.token);

        this.subscription = tryObserveByObservable(this.context.scope, this.directive, listener, true);

        listener();
    }

    private onKeyChange(): void
    {
        if (this.key)
        {
            this.metadata.defaults.delete(this.key);
            this.metadata.placeholders.delete(this.key);
        }

        this.key = `${tryEvaluateKeyExpressionByTraceable(this.context.scope, this.directive)}`;

        this.metadata.defaults.set(this.key, this.applyLazyInjection.bind(this));
        this.metadata.placeholders.set(this.key, this.inject.bind(this));

        if (this.context.host.isConnected)
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
        assert(this.injectionContext);

        this.currentDisposable?.dispose();

        this.templateBlock.clear();

        let destructured = false;

        const { elementScope, scopeAlias } = (destructured = !TypeGuard.isIdentifier(this.injectionContext.directive.pattern))
            ? { elementScope: tryEvaluatePatternByTraceable(this.context.scope, tryEvaluateExpressionByTraceable(this.context.scope, this.directive), this.injectionContext.directive), scopeAlias: "__scope__" }
            : { elementScope: tryEvaluateExpressionByTraceable(this.context.scope, this.directive) as Indexer, scopeAlias: this.injectionContext.directive.pattern.name };

        const mergedScope = destructured
            ? { ...elementScope, ...this.injectionContext.scope }
            : { [scopeAlias]: elementScope, ...this.injectionContext.scope };

        const content = this.injectionContext.template.content.cloneNode(true);

        const context: TemplateProcessorContext =
        {
            descriptor: this.injectionContext.directive.descriptor,
            host:       this.injectionContext.host,
            parentNode: this.injectionContext.parentNode,
            root:       content,
            scope:      mergedScope,
        };

        const disposable = TemplateProcessor.process(context);

        this.templateBlock.setContent(content);

        this.currentDisposable = disposable;
    }

    private defaultTask(): void
    {
        this.currentDisposable?.dispose();

        this.templateBlock.clear();

        const content =  this.template.content.cloneNode(true);

        const context: TemplateProcessorContext =
        {
            descriptor: this.directive.descriptor,
            host:       this.context!.host,
            parentNode: this.context.parentNode,
            root:       content,
            scope:      this.context.scope,
        };

        const disposable = TemplateProcessor.process(context);

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

            this.disposed = true;
        }
    }
}