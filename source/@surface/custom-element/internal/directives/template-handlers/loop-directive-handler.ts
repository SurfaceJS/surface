import { Delegate, IDisposable }                                             from "@surface/core";
import { TypeGuard }                                                         from "@surface/expression";
import { ISubscription }                                                     from "@surface/reactive";
import { tryEvaluateExpression, tryEvaluatePattern, tryObserveByObservable } from "../../common";
import ILoopDirective                                                        from "../../interfaces/loop-directive";
import ParallelWorker                                                        from "../../parallel-worker";
import TemplateBlock                                                         from "../template-block";
import TemplateDirectiveHandler                                              from ".";

type Cache = { templateBlock: TemplateBlock, value: unknown, disposable: IDisposable };

export default class LoopDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly cache:         Cache[] = [];
    private readonly directive:     ILoopDirective;
    private readonly iterator:      (elements: Iterable<unknown>, action: Delegate<[unknown, number]>) => number;
    private readonly subscription:  ISubscription;
    private readonly template:      HTMLTemplateElement;
    private readonly templateBlock: TemplateBlock = new TemplateBlock();
    private readonly tree:          DocumentFragment;

    private disposed: boolean = false;

    public constructor(scope: object, context: Node, host: Node, template: HTMLTemplateElement, directive: ILoopDirective)
    {
        super(scope, context, host);

        this.template  = template;
        this.directive = directive;
        this.tree      = document.createDocumentFragment();

        this.iterator = directive.operator == "in" ? this.forInIterator : this.forOfIterator;

        const parent = this.template.parentNode!;

        this.templateBlock.insertAt(parent, template);

        const notify = (): void => ParallelWorker.run(this.task.bind(this));

        this.subscription = tryObserveByObservable(scope, directive, { notify }, true);

        notify();
    }

    private action(value: unknown, index: number): void
    {
        if (index >= this.cache.length || !Object.is(this.cache[index].value, value))
        {
            const mergedScope = TypeGuard.isIdentifier(this.directive.left)
                ? { ...this.scope, [this.directive.left.name]: value }
                : { ...this.scope, ...tryEvaluatePattern(this.scope, this.directive.left, value, this.directive.rawExpression, this.directive.stackTrace) };

            const templateBlock = new TemplateBlock();

            const [content, disposable] = this.processTemplate(mergedScope, this.context, this.host, this.template, this.directive.descriptor);

            if (index < this.cache.length)
            {
                const entry = this.cache[index];

                entry.disposable.dispose();
                entry.templateBlock.dispose();

                this.cache[index] = { disposable, templateBlock, value };
            }
            else
            {
                this.cache.push({ disposable, templateBlock, value });
            }

            templateBlock.connect(this.tree);

            templateBlock.setContent(content);
        }
        else
        {
            const templateBlock = this.cache[index].templateBlock;

            let simbling: ChildNode | null = null;

            const clone = templateBlock.open.cloneNode() as Comment;

            this.tree.appendChild(clone);

            while ((simbling = templateBlock.open.nextSibling) && simbling != templateBlock.close)
            {
                this.tree.appendChild(simbling);
            }

            templateBlock.makeSingleUser();

            this.tree.replaceChild(templateBlock.open, clone);
            this.tree.appendChild(templateBlock.close);
        }
    }

    private clearCache(index: number): void
    {
        for (const entry of this.cache.splice(index))
        {
            const { templateBlock, disposable } = entry;

            disposable.dispose();
            templateBlock.dispose();
        }
    }

    private forOfIterator(elements: Iterable<unknown>): number
    {
        let index = 0;

        for (const element of elements)
        {
            this.action(element, index++);
        }

        return index;
    }

    private forInIterator(elements: Iterable<unknown>): number
    {
        let index = 0;

        for (const element in elements)
        {
            this.action(element, index++);
        }

        return index;
    }

    private task(): void
    {
        if (this.disposed)
        {
            return;
        }

        const elements = tryEvaluateExpression(this.scope, this.directive.right, this.directive.rawExpression, this.directive.stackTrace) as Iterable<unknown>;

        const index = this.iterator(elements, this.action);

        this.clearCache(index);

        this.templateBlock.setContent(this.tree);
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            for (const entry of this.cache.splice(0))
            {
                const { templateBlock, disposable } = entry;

                disposable.dispose();
                templateBlock.dispose();
            }

            this.subscription.unsubscribe();
            this.templateBlock.dispose();

            this.disposed = true;
        }
    }
}