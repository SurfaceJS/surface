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

type Cache =
{
    disposables: IDisposable[],
    elements:    unknown[],
};

export default class LoopDirective implements IDisposable
{
    private readonly cache:                   Cache                   = { disposables: [], elements: [] };
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly context:                 TemplateDirectiveContext;
    private readonly descriptor:              LoopDirectiveDescriptor;
    private readonly disposables:             IDisposable[]           = [];
    private readonly iterator:                (elements: Iterable<unknown>, action: Delegate<[unknown, number]>) => number;
    private readonly subscription:            Subscription;
    private readonly template:                HTMLTemplateElement;
    private readonly templateBlock:           TemplateBlock           = new TemplateBlock();
    private readonly tree:                    DocumentFragment;

    private changed:     boolean = false;
    private disposed:    boolean = false;
    private indexChange: number  = 0;

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
        if (this.changed || !Object.is(value, this.cache.elements[index]))
        {
            if (!this.changed)
            {
                this.changed     = true;
                this.indexChange = index;
            }

            this.cache.elements[index] = value;

            const directiveScope = tryEvaluatePattern(this.context.scope, this.descriptor.left, value, this.descriptor.rawExpression, this.descriptor.stackTrace);
            const mergedScope    = { ...this.context.scope, ...directiveScope };

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

            this.disposables.push(block);
            this.disposables.push(disposable);

            const multiple = 1000;

            const count = index + 1;

            if (Math.ceil(count / multiple) * multiple == count)
            {
                this.cache.disposables.splice(this.indexChange * 2).forEach(x => x.dispose());

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
            this.cache.disposables.splice(0).forEach(x => x.dispose());
            this.cache.elements.length = 0;
        }
        else
        {
            this.changed     = false;
            this.indexChange = 0;

            const size = this.iterator(elements, this.action);

            const task = (): void =>
            {
                if (!this.changed)
                {
                    this.indexChange = size;
                }

                this.cache.elements.splice(size);

                this.cache.disposables.splice(this.indexChange * 2).forEach(x => x.dispose());

                if (this.indexChange > 0)
                {
                    this.cache.disposables.push(...this.disposables.splice(0));
                }
                else
                {
                    this.cache.disposables = this.disposables.splice(0);
                }

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

            this.disposables.splice(0).forEach(x => x.dispose());

            this.cache.disposables.splice(0).forEach(x => x.dispose());
            this.cache.elements.length = 0;

            this.subscription.unsubscribe();
            this.templateBlock.dispose();

            this.disposed = true;
        }
    }
}