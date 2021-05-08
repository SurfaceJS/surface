import type { Delegate, IDisposable }                                        from "@surface/core";
import { CancellationTokenSource }                                           from "@surface/core";
import type { Subscription }                                                 from "@surface/observer";
import { tryEvaluateExpression, tryEvaluatePattern, tryObserveByObservable } from "../common.js";
import TemplateProcessor                                                     from "../processors/template-processor.js";
import { scheduler }                                                         from "../singletons.js";
import type LoopDirectiveDescriptor                                          from "../types/loop-directive-descriptor";
import type TemplateDirectiveContext                                         from "../types/template-directive-context";
import type TemplateProcessorContext                                         from "../types/template-processor-context";
import TemplateBlock                                                         from "./template-block.js";

class Cache
{
    public changed:     boolean       = false;
    public cursor:      number        = 0;
    public disposables: IDisposable[] = [];
    public elements:    unknown[]     = [];
    public stored:      number        = 0;

    public trim(): void
    {
        if (this.stored > 0)
        {
            this.disposables.splice(this.cursor * 2, (this.stored - this.cursor) * 2).forEach(x => x.dispose());

            this.stored = 0;
        }
    }

    public resize(size: number): void
    {
        if (!this.changed)
        {
            this.cursor = size;
        }

        this.trim();

        this.changed = false;
        this.cursor  = 0;
        this.stored  = size;

        this.elements.splice(size);
    }
}

export default class LoopDirective implements IDisposable
{
    private static readonly maximumAmount: number = 1000;

    private readonly cache:                   Cache                   = new Cache();
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly context:                 TemplateDirectiveContext;
    private readonly descriptor:              LoopDirectiveDescriptor;
    private readonly iterator:                (elements: Iterable<unknown>, action: Delegate<[unknown, number]>) => number;
    private readonly subscription:            Subscription;
    private readonly template:                HTMLTemplateElement;
    private readonly templateBlock:           TemplateBlock           = new TemplateBlock();
    private readonly tree:                    DocumentFragment;

    private disposed: boolean = false;

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
        if (this.cache.changed || !Object.is(value, this.cache.elements[index]))
        {
            if (!this.cache.changed)
            {
                this.cache.changed     = true;
                this.cache.cursor = index;
            }

            this.cache.elements[index] = value;

            const directiveScope = tryEvaluatePattern(this.context.scope, this.descriptor.left, value, this.descriptor.rawExpression, this.descriptor.stackTrace);
            const mergedScope    = { $index: index, ...this.context.scope, ...directiveScope };

            const content = this.template.content.cloneNode(true);

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

            this.cache.disposables.push(block);
            this.cache.disposables.push(disposable);

            const count = index + 1;

            if (Math.ceil(count / LoopDirective.maximumAmount) * LoopDirective.maximumAmount == count)
            {
                this.cache.trim();

                this.templateBlock.setContent(this.tree, false);
            }
        }
    }

    private forOfIterator(elements: Iterable<unknown>): number
    {
        let index = 0;

        for (const element of elements)
        {
            const current = index++;

            void scheduler.enqueue(() => this.action(element, current), "high", this.cancellationTokenSource.token);
        }

        return index;
    }

    private forInIterator(elements: Iterable<unknown>): number
    {
        let index = 0;

        for (const element in elements)
        {
            const current = index++;

            void scheduler.enqueue(() => this.action(element, current), "high", this.cancellationTokenSource.token);
        }

        return index;
    }

    private readonly task = (): void =>
    {
        if (this.disposed)
        {
            return;
        }

        const elements = tryEvaluateExpression(this.context.scope, this.descriptor.right, this.descriptor.rawExpression, this.descriptor.stackTrace) as Iterable<unknown>;

        if (elements[Symbol.iterator]().next().done)
        {
            this.cache.resize(0);
        }
        else
        {
            const size = this.iterator(elements, this.action);

            const task = (): void =>
            {
                this.cache.resize(size);

                this.templateBlock.setContent(this.tree, false);
            };

            void scheduler.enqueue(task, "high", this.cancellationTokenSource.token);
        }
    };

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.cancellationTokenSource.cancel();

            this.cache.resize(0);

            this.subscription.unsubscribe();
            this.templateBlock.dispose();

            this.disposed = true;
        }
    }
}