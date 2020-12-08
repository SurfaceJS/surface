import type { Delegate, IDisposable }                                        from "@surface/core";
import { CancellationTokenSource }                                           from "@surface/core";
import { TypeGuard }                                                         from "@surface/expression";
import type { Subscription }                                                 from "@surface/reactive";
import { tryEvaluateExpression, tryEvaluatePattern, tryObserveByObservable } from "../../common.js";
import type ILoopDirective                                                   from "../../interfaces/loop-directive";
import { scheduler }                                                         from "../../singletons.js";
import TemplateBlock                                                         from "../template-block.js";
import TemplateDirectiveHandler                                              from "./template-directive-handler.js";

export default class LoopDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly directive:               ILoopDirective;
    private readonly disposables:             IDisposable[] = [];
    private readonly iterator:                (elements: Iterable<unknown>, action: Delegate<[unknown, number]>) => void;
    private readonly subscription:            Subscription;
    private readonly template:                HTMLTemplateElement;
    private readonly templateBlock:           TemplateBlock = new TemplateBlock();
    private readonly tree:                    DocumentFragment;

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

        const listener = (): void => void scheduler.enqueue(this.task.bind(this), "normal", this.cancellationTokenSource.token);

        this.subscription = tryObserveByObservable(scope, directive, listener, true);

        listener();
    }

    private action(value: unknown, index: number): void
    {
        const mergedScope = TypeGuard.isIdentifier(this.directive.left)
            ? { ...this.scope, [this.directive.left.name]: value }
            : { ...this.scope, ...tryEvaluatePattern(this.scope, this.directive.left, value, this.directive.rawExpression, this.directive.stackTrace) };

        const [content, disposable] = this.processTemplate(mergedScope, this.context, this.host, this.template, this.directive.descriptor);

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

        const elements = tryEvaluateExpression(this.scope, this.directive.right, this.directive.rawExpression, this.directive.stackTrace) as Iterable<unknown>;

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