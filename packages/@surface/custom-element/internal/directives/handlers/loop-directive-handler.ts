import type { Delegate, IDisposable }                                        from "@surface/core";
import { CancellationTokenSource }                                           from "@surface/core";
import { TypeGuard }                                                         from "@surface/expression";
import type { Subscription }                                                 from "@surface/reactive";
import { tryEvaluateExpression, tryEvaluatePattern, tryObserveByObservable } from "../../common.js";
import type ILoopDirective                                                   from "../../interfaces/loop-directive";
import TemplateProcessor                                                     from "../../processors/template-processor.js";
import { scheduler }                                                         from "../../singletons.js";
import type TemplateDirectiveContext                                         from "../../types/template-directive-context";
import type TemplateProcessorContext                                         from "../../types/template-processor-context";
import TemplateBlock                                                         from "../template-block.js";

export default class LoopDirectiveHandler implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly context:                 TemplateDirectiveContext;
    private readonly directive:               ILoopDirective;
    private readonly disposables:             IDisposable[] = [];
    private readonly iterator:                (elements: Iterable<unknown>, action: Delegate<[unknown, number]>) => void;
    private readonly subscription:            Subscription;
    private readonly template:                HTMLTemplateElement;
    private readonly templateBlock:           TemplateBlock = new TemplateBlock();
    private readonly tree:                    DocumentFragment;

    private disposed: boolean = false;

    public constructor(template: HTMLTemplateElement, directive: ILoopDirective, context: TemplateDirectiveContext)
    {
        this.template  = template;
        this.directive = directive;
        this.context   = context;
        this.tree      = document.createDocumentFragment();

        this.iterator = directive.operator == "in" ? this.forInIterator : this.forOfIterator;

        const parent = this.template.parentNode!;

        this.templateBlock.insertAt(parent, template);

        const listener = (): void => void scheduler.enqueue(this.task.bind(this), "normal", this.cancellationTokenSource.token);

        this.subscription = tryObserveByObservable(context.scope, directive, listener, true);

        listener();
    }

    private action(value: unknown, index: number): void
    {
        const mergedScope = TypeGuard.isIdentifier(this.directive.left)
            ? { ...this.context.scope, [this.directive.left.name]: value }
            : { ...this.context.scope, ...tryEvaluatePattern(this.context.scope, this.directive.left, value, this.directive.rawExpression, this.directive.stackTrace) };

        const content =  this.template.content.cloneNode(true);

        const context: TemplateProcessorContext =
        {
            customDirectives: this.context.customDirectives,
            descriptor:       this.directive.descriptor,
            host:             this.context!.host,
            parentNode:       this.context.parentNode,
            root:             content,
            scope:            mergedScope,
        };

        const disposable = TemplateProcessor.process(context);

        const block = new TemplateBlock();

        block.connect(this.tree);

        block.setContent(content);

        this.disposables.push(block);
        this.disposables.push(disposable);

        const multiple = 1000;

        if (Math.ceil(index / multiple) * multiple == index)
        {
            this.templateBlock.setContent(this.tree);
        }
    }

    private forOfIterator(elements: Iterable<unknown>): void
    {
        let index = 0;

        for (const element of elements)
        {
            const current = ++index;

            void scheduler.enqueue(() => this.action(element, current), "high", this.cancellationTokenSource.token);
        }
    }

    private forInIterator(elements: Iterable<unknown>): void
    {
        let index = 0;

        for (const element in elements)
        {
            const current = ++index;

            void scheduler.enqueue(() => this.action(element, current), "high", this.cancellationTokenSource.token);
        }
    }

    private task(): void
    {
        if (this.disposed)
        {
            return;
        }

        this.disposables.splice(0).forEach(x => x.dispose());

        const elements = tryEvaluateExpression(this.context.scope, this.directive.right, this.directive.rawExpression, this.directive.stackTrace) as Iterable<unknown>;

        this.iterator(elements, this.action);

        void scheduler.enqueue(() => this.templateBlock.setContent(this.tree), "high", this.cancellationTokenSource.token);
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.cancellationTokenSource.cancel();

            this.disposables.splice(0).forEach(x => x.dispose());

            this.subscription.unsubscribe();
            this.templateBlock.dispose();

            this.disposed = true;
        }
    }
}