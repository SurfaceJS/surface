import { Indexer }                                   from "@surface/core";
import { assert }                                    from "@surface/core/common/generic";
import IDisposable                                   from "@surface/core/interfaces/disposable";
import TypeGuard                                     from "@surface/expression/type-guard";
import ISubscription                                 from "@surface/reactive/interfaces/subscription";
import { tryEvaluateExpression, tryEvaluatePattern } from "../../common";
import DataBind                                      from "../../data-bind";
import IInjectDirective                              from "../../interfaces/inject-directive";
import IInjectorDirective                            from "../../interfaces/injector-directive";
import TemplateMetadata                              from "../../metadata/template-metadata";
import ParallelWorker                                from "../../parallel-worker";
import { Scope }                                     from "../../types";
import TemplateDirectiveHandler                      from "./";

export default class InjectorDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly directive: IInjectorDirective;
    private readonly end:       Comment;
    private readonly key:       string;
    private readonly metadata:  TemplateMetadata;
    private readonly start:     Comment;
    private readonly template:  HTMLTemplateElement;

    private currentDisposable: IDisposable|null   = null;
    private disposed:          boolean            = false;
    private subscription:      ISubscription|null = null;
    private timer:             number             = 0;

    public constructor(scope: Scope, context: Node, host: Node, template: HTMLTemplateElement, directive: IInjectorDirective)
    {
        super(scope, context, host);

        this.template  = template;
        this.directive = directive;
        this.metadata  = TemplateMetadata.from(this.host);
        this.start     = document.createComment("");
        this.end       = document.createComment("");
        this.key       = `${directive.key.evaluate(scope)}`;

        assert(template.parentNode);

        const parent = template.parentNode;

        parent.replaceChild(this.end, template);
        parent.insertBefore(this.start, this.end);

        this.metadata.defaults.set(this.key, this.defaultInjection.bind(this));
        this.metadata.injectors.set(this.key, this.inject.bind(this));

        if (this.host.isConnected)
        {
            const injection = this.metadata.injections.get(this.key);

            injection
                ? this.inject(injection.scope, injection.context, injection.host, injection.template, injection.directive)
                : this.inject(scope, this.context, this.host, this.template);
        }
        else
        {
            this.defaultInjection();
        }
    }

    private defaultInjection()
    {
        this.timer = window.setTimeout(() => this.inject(this.scope, this.context, this.host, this.template));
    }

    private inject(localScope: Scope, context: Node, host: Node, template: HTMLTemplateElement, injectDirective?: IInjectDirective): void
    {
        window.clearTimeout(this.timer);

        this.currentDisposable?.dispose();
        this.currentDisposable = null;

        this.subscription?.unsubscribe();
        this.subscription = null;

        const task = injectDirective
            ? () =>
            {
                this.currentDisposable?.dispose();

                this.removeInRange(this.start, this.end);

                let destructured = false;

                const { elementScope, scopeAlias } = (destructured = !TypeGuard.isIdentifier(injectDirective.pattern))
                    ? { elementScope: tryEvaluatePattern(this.scope, injectDirective.pattern, tryEvaluateExpression(this.scope, this.directive.expression, this.directive.stackTrace), injectDirective.stackTrace), scopeAlias: "" }
                    : { elementScope: tryEvaluateExpression(this.scope, this.directive.expression, this.directive.stackTrace) as Indexer, scopeAlias: injectDirective.pattern.name };

                const mergedScope = destructured
                    ? { ...elementScope, ...localScope }
                    : { [scopeAlias]: elementScope, ...localScope };

                const [content, disposable] = this.processTemplate(mergedScope, context, host, template, injectDirective.descriptor);

                this.end.parentNode!.insertBefore(content, this.end);

                this.currentDisposable = disposable;
            }
            : this.task.bind(this);

        const notify = async () => await ParallelWorker.run(task);

        this.subscription = DataBind.observe(this.scope, this.directive.observables, { notify }, true);

        this.fireAsync(notify);
    }

    private task(): void
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

            this.subscription!.unsubscribe();

            this.metadata.injectors.delete(this.key);

            this.removeInRange(this.start, this.end);

            this.start.remove();
            this.end.remove();

            this.disposed = true;
        }
    }
}