import { Action2, IDisposable, Nullable }            from "@surface/core";
import { TypeGuard }                                 from "@surface/expression";
import { ISubscription }                             from "@surface/reactive";
import { tryEvaluateExpression, tryEvaluatePattern } from "../../common";
import DataBind                                      from "../../data-bind";
import ILoopDirective                                from "../../interfaces/loop-directive";
import ParallelWorker                                from "../../parallel-worker";
import { Scope }                                     from "../../types";
import TemplateDirectiveHandler                      from "./";

type Cache = { start: Comment, end: Comment, value: unknown, disposable: IDisposable };

export default class LoopDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly cache:        Array<Cache> = [];
    private readonly end:          Comment;
    private readonly iterator:     (elements: Iterable<unknown>, action: Action2<unknown, number>) => number;
    private readonly start:        Comment;
    private readonly directive:    ILoopDirective;
    private readonly subscription: ISubscription;
    private readonly template:     HTMLTemplateElement;
    private readonly tree:         DocumentFragment;

    private disposed: boolean = false;

    public constructor(scope: Scope, context: Node, host: Node, template: HTMLTemplateElement, directive: ILoopDirective)
    {
        super(scope, context, host);

        this.template  = template;
        this.directive = directive;

        this.tree  = document.createDocumentFragment();
        this.start = document.createComment("");
        this.end   = document.createComment("");

        this.iterator = directive.operator == "in" ? this.forInIterator : this.forOfIterator;

        const parent = this.template.parentNode!;

        parent.replaceChild(this.end, template);
        parent.insertBefore(this.start, this.end);

        const notify = async () => await ParallelWorker.run(this.task.bind(this));

        this.subscription = DataBind.observe(scope, directive.observables, { notify }, true);

        super.fireAsync(notify);
    }

    private action(value: unknown, index: number): void
    {
        if (index >= this.cache.length || !Object.is(this.cache[index].value, value))
        {
            const mergedScope = TypeGuard.isIdentifier(this.directive.left)
                ? { ...this.scope, [this.directive.left.name]: value }
                : { ...tryEvaluatePattern(this.scope, this.directive.left, value, this.directive.stackTrace), ...this.scope };

            const start = document.createComment("");
            const end   = document.createComment("");

            const [content, disposable] = super.processTemplate(mergedScope, this.context, this.host, this.template, this.directive.descriptor);

            if (index < this.cache.length)
            {
                const entry = this.cache[index];

                entry.disposable.dispose();

                this.removeInRange(entry.start, entry.end);

                entry.start.remove();
                entry.end.remove();

                this.cache[index] = { start, end, disposable, value };
            }
            else
            {
                this.cache.push({ start, end, disposable, value });
            }

            this.tree.appendChild(start);

            this.tree.appendChild(content);

            this.tree.appendChild(end);
        }
        else
        {
            const { start, end } = this.cache[index];

            let simbling: Nullable<ChildNode> = null;

            const clone = start.cloneNode() as Comment;

            this.tree.appendChild(clone);

            while ((simbling = start.nextSibling) && simbling != end)
            {
                this.tree.appendChild(simbling);
            }

            this.tree.replaceChild(start, clone);
            this.tree.appendChild(end);
        }
    }

    private clearCache(index: number)
    {
        for (const entry of this.cache.splice(index))
        {
            const { start, end, disposable } = entry;

            disposable.dispose();

            super.removeInRange(start, end);

            start.remove();
            end.remove();
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

        const elements = tryEvaluateExpression(this.scope, this.directive.right, this.directive.stackTrace) as Iterable<unknown>;

        const index = this.iterator(elements, this.action);

        this.clearCache(index);

        this.end.parentNode!.insertBefore(this.tree, this.end);
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            for (const entry of this.cache.splice(0))
            {
                const { start, end, disposable } = entry;

                disposable.dispose();

                super.removeInRange(start, end);

                start.remove();
                end.remove();
            }

            this.subscription.unsubscribe();

            super.removeInRange(this.start, this.end);

            this.start.remove();
            this.end.remove();

            this.disposed = true;
        }
    }
}