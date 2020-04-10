import { Action1 }              from "@surface/core";
import { assert, typeGuard }    from "@surface/core/common/generic";
import IDisposable              from "@surface/core/interfaces/disposable";
import Evaluate                 from "@surface/expression/evaluate";
import IPattern                 from "@surface/expression/interfaces/pattern";
import ISubscription            from "@surface/reactive/interfaces/subscription";
import ILoopDirective           from "../../interfaces/loop-directive";
import TemplateMetadata         from "../../metadata/template-metadata";
import ObserverVisitor          from "../../observer-visitor";
import ParallelWorker           from "../../parallel-worker";
import { Scope }                from "../../types";
import TemplateDirectiveHandler from "./";

export default class LoopDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly cache:        Array<[ChildNode, ChildNode, IDisposable]> = [];
    private readonly end:          Comment;
    private readonly iterator:     (elements: unknown[], action: Action1<unknown>) => void;
    private readonly start:        Comment;
    private readonly directive:    ILoopDirective;
    private readonly subscription: ISubscription;
    private readonly template:     HTMLTemplateElement;
    private readonly tree:         DocumentFragment;

    private disposed: boolean = false;

    public constructor(scope: Scope, host: Node, template: HTMLTemplateElement, directive: ILoopDirective)
    {
        super(scope, host);

        this.template  = template;
        this.directive = directive;

        this.tree  = document.createDocumentFragment();
        this.start = document.createComment("");
        this.end   = document.createComment("");

        this.iterator = directive.operator == "in" ? this.forInIterator : this.forOfIterator;

        assert(this.template.parentNode);

        const parent = this.template.parentNode;

        parent.replaceChild(this.end, template);
        parent.insertBefore(this.start, this.end);

        const notify = async () => await ParallelWorker.run(() => this.task());

        this.subscription = ObserverVisitor.observe(scope, directive.expression, { notify }, true);

        super.fireAsync(notify);
    }

    private action(element: unknown): void
    {
        const mergedScope = typeGuard<IPattern>(this.directive.alias, this.directive.destructured)
            ? { ...Evaluate.pattern(this.scope, this.directive.alias, element), ...this.scope }
            : { ...this.scope, [this.directive.alias]: element };

        const rowStart = document.createComment("");
        const rowEnd   = document.createComment("");

        this.tree.appendChild(rowStart);

        const [content, disposable] = super.processTemplate(mergedScope, this.host, this.template, this.directive.descriptor, TemplateMetadata.from(this.start.parentNode!));

        this.cache.push([rowStart, rowEnd, disposable]);

        this.tree.appendChild(content);

        this.tree.appendChild(rowEnd);
    }

    private forOfIterator(elements: Array<unknown>): void
    {
        for (const element of elements)
        {
            this.action(element);
        }
    }

    private forInIterator(elements: Array<unknown>): void
    {
        for (const element in elements)
        {
            this.action(element);
        }
    }

    private task(): void
    {
        if (this.disposed)
        {
            return;
        }

        const elements = this.directive.expression.evaluate(this.scope) as Array<Element>;

        for (const [rowStart, rowEnd, disposable] of this.cache)
        {
            disposable.dispose();

            super.removeInRange(rowStart, rowEnd);

            rowStart.remove();
            rowEnd.remove();
        }

        this.cache.splice(0);

        this.iterator(elements, this.action);

        this.end.parentNode!.insertBefore(this.tree, this.end);
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            for (const entry of this.cache)
            {
                const [rowStart, rowEnd, disposable] = entry;

                disposable.dispose();

                super.removeInRange(rowStart, rowEnd);

                rowStart.remove();
                rowEnd.remove();
            }

            this.subscription.unsubscribe();

            super.removeInRange(this.start, this.end);

            this.start.remove();
            this.end.remove();

            this.disposed = true;
        }
    }
}