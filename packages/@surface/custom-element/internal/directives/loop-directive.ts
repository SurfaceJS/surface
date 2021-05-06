import type { Delegate, IDisposable }                                        from "@surface/core";
import { CancellationTokenSource }                                           from "@surface/core";
import { TypeGuard }                                                         from "@surface/expression";
import type { Subscription }                                                 from "@surface/observer";
import { tryEvaluateExpression, tryEvaluatePattern, tryObserveByObservable } from "../common.js";
import TemplateProcessor                                                     from "../processors/template-processor.js";
import { scheduler }                                                         from "../singletons.js";
import type LoopDirectiveDescriptor                                          from "../types/loop-directive-descriptor";
import type TemplateDirectiveContext                                         from "../types/template-directive-context";
import type TemplateProcessorContext                                         from "../types/template-processor-context";
import TemplateBlock                                                         from "./template-block.js";

export default class LoopDirective implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly context:                 TemplateDirectiveContext;
    private readonly descriptor:              LoopDirectiveDescriptor;
    private readonly disposables:             IDisposable[] = [];
    private readonly iterator:                (elements: Iterable<unknown>, action: Delegate<[unknown, number]>) => void;
    private readonly subscription:            Subscription;
    private readonly template:                HTMLTemplateElement;
    private readonly templateBlock:           TemplateBlock = new TemplateBlock();
    private readonly tree:                    DocumentFragment;

    private disposed:            boolean       = false;
    private previousDisposables: IDisposable[] = [];

    public constructor(template: HTMLTemplateElement, descriptor: LoopDirectiveDescriptor, context: TemplateDirectiveContext)
    {
        this.template   = template;
        this.descriptor = descriptor;
        this.context    = context;
        this.tree       = document.createDocumentFragment();

        this.iterator = descriptor.operator == "in" ? this.forInIterator : this.forOfIterator;

        const parent = this.template.parentNode!;

        this.templateBlock.insertAt(parent, template);

        const listener = (): void => void scheduler.enqueue(this.task, "normal", this.cancellationTokenSource.token);

        this.subscription = tryObserveByObservable(context.scope, descriptor, listener, true);

        listener();
    }

    private action(value: unknown, index: number): void
    {
        const mergedScope = TypeGuard.isIdentifier(this.descriptor.left)
            ? { ...this.context.scope, [this.descriptor.left.name]: value }
            : { ...this.context.scope, ...tryEvaluatePattern(this.context.scope, this.descriptor.left, value, this.descriptor.rawExpression, this.descriptor.stackTrace) };

        const content =  this.template.content.cloneNode(true);

        const context: TemplateProcessorContext =
        {
            customDirectives:   this.context.customDirectives,
            host:               this.context!.host,
            parentNode:         this.context.parentNode,
            root:               content,
            scope:              mergedScope,
            templateDescriptor: this.descriptor.descriptor,
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
            const task = (): void =>
            {
                this.previousDisposables.splice(0, multiple * 2).forEach(x => x.dispose());

                this.templateBlock.setContent(this.tree);
            };

            void scheduler.enqueue(task, "high", this.cancellationTokenSource.token);
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

    private readonly task = (): void =>
    {
        if (this.disposed)
        {
            return;
        }

        const elements = tryEvaluateExpression(this.context.scope, this.descriptor.right, this.descriptor.rawExpression, this.descriptor.stackTrace) as Iterable<unknown>;

        this.previousDisposables = this.disposables.splice(0);

        if (elements[Symbol.iterator]().next().done)
        {
            this.previousDisposables.splice(0).forEach(x => x.dispose());
        }
        else
        {
            this.iterator(elements, this.action);

            const task = (): void =>
            {
                this.previousDisposables.splice(0).forEach(x => x.dispose());

                this.templateBlock.setContent(this.tree);
            };

            void scheduler.enqueue(task, "high", this.cancellationTokenSource.token);
        }
    };

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.cancellationTokenSource.cancel();

            this.disposables.splice(0).forEach(x => x.dispose());
            this.previousDisposables.splice(0).forEach(x => x.dispose());

            this.subscription.unsubscribe();
            this.templateBlock.dispose();

            this.disposed = true;
        }
    }
}