import type { IDisposable }                from "@surface/core";
import { CancellationTokenSource, assert } from "@surface/core";
import type { Subscription }               from "@surface/observer";
import
{
    tryEvaluateExpressionByTraceable,
    tryEvaluateKeyExpressionByTraceable,
    tryEvaluatePatternByTraceable,
    tryObserveByObservable,
    tryObserveKeyByObservable,
} from "../common.js";
import TemplateMetadata                    from "../metadata/template-metadata.js";
import TemplateProcessor                   from "../processors/template-processor.js";
import { scheduler }                       from "../singletons.js";
import type InjectionContext               from "../types/injection-context";
import type PlaceholderDirectiveDescriptor from "../types/placeholder-directive-descriptor";
import type TemplateDirectiveContext       from "../types/template-directive-context.js";
import type TemplateProcessorContext       from "../types/template-processor-context.js";
import TemplateBlock                       from "./template-block.js";

export default class PlaceholderDirective implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly context:                 TemplateDirectiveContext;
    private readonly descriptor:              PlaceholderDirectiveDescriptor;
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

    public constructor(template: HTMLTemplateElement, descriptor: PlaceholderDirectiveDescriptor, context: TemplateDirectiveContext)
    {
        this.template   = template;
        this.descriptor = descriptor;
        this.context    = context;
        this.metadata   = TemplateMetadata.from(context.host);

        assert(template.parentNode);

        const parent = template.parentNode;

        this.templateBlock.insertAt(parent, template);

        this.keySubscription = tryObserveKeyByObservable(context.scope, descriptor, this.onKeyChange, true);

        this.onKeyChange();
    }

    private readonly applyInjection = (): void =>
    {
        const injection = this.metadata.injections.get(this.key);

        this.inject(injection);
    };

    private readonly applyLazyInjection = (): void =>
    {
        this.lazyInjectionCancellationTokenSource = new CancellationTokenSource();

        void scheduler.enqueue(this.applyInjection, "low", this.lazyInjectionCancellationTokenSource.token);
    };

    private readonly inject = (injection?: InjectionContext): void =>
    {
        this.lazyInjectionCancellationTokenSource.cancel();

        this.currentDisposable?.dispose();
        this.currentDisposable = null;

        this.subscription?.unsubscribe();
        this.subscription = null;

        const task = (this.injectionContext = injection)
            ? this.task
            : this.defaultTask;

        const listener = (): void => void scheduler.enqueue(task, "normal", this.cancellationTokenSource.token);

        this.subscription = tryObserveByObservable(this.context.scope, this.descriptor, listener, true);

        listener();
    };

    private readonly onKeyChange = (): void =>
    {
        if (this.key)
        {
            this.metadata.defaults.delete(this.key);
            this.metadata.placeholders.delete(this.key);
        }

        this.key = `${tryEvaluateKeyExpressionByTraceable(this.context.scope, this.descriptor)}`;

        this.metadata.defaults.set(this.key, this.applyLazyInjection);
        this.metadata.placeholders.set(this.key, this.inject);

        if (this.context.host.isConnected)
        {
            this.applyInjection();
        }
        else
        {
            this.applyLazyInjection();
        }
    };

    private readonly task = (): void =>
    {
        assert(this.injectionContext);

        this.currentDisposable?.dispose();

        this.templateBlock.clear();

        const value          = tryEvaluateExpressionByTraceable(this.context.scope, this.descriptor);
        const directiveScope = tryEvaluatePatternByTraceable(this.context.scope, value, this.injectionContext.descriptor);
        const mergedScope    = { ...this.injectionContext.scope, ...directiveScope };

        const content = this.injectionContext.template.content.cloneNode(true);

        const context: TemplateProcessorContext =
        {
            directives:         this.injectionContext.customDirectives,
            host:               this.injectionContext.host,
            parentNode:         this.injectionContext.parentNode,
            root:               content,
            scope:              mergedScope,
            templateDescriptor: this.injectionContext.descriptor.descriptor,
        };

        const disposable = TemplateProcessor.process(context);

        this.templateBlock.setContent(content);

        this.currentDisposable = disposable;
    };

    private readonly defaultTask = (): void =>
    {
        this.currentDisposable?.dispose();

        this.templateBlock.clear();

        const content =  this.template.content.cloneNode(true);

        const context: TemplateProcessorContext =
        {
            directives:         this.context.directives,
            host:               this.context!.host,
            parentNode:         this.context.parentNode,
            root:               content,
            scope:              this.context.scope,
            templateDescriptor: this.descriptor.descriptor,
        };

        const disposable = TemplateProcessor.process(context);

        this.templateBlock.setContent(content);

        this.currentDisposable = disposable;
    };

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