import { assert }               from "@surface/core/common/generic";
import IDisposable              from "@surface/core/interfaces/disposable";
import IExpression              from "@surface/expression/interfaces/expression";
import ISubscription            from "@surface/reactive/interfaces/subscription";
import IChoiceDirectiveBranch   from "../../interfaces/choice-directive-branch";
import ITemplateDescriptor      from "../../interfaces/template-descriptor";
import TemplateMetadata         from "../../metadata/template-metadata";
import ObserverVisitor          from "../../observer-visitor";
import ParallelWorker           from "../../parallel-worker";
import { Scope }                from "../../types";
import TemplateDirectiveHandler from "./";

export default class ChoiceDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly end:           Comment;
    private readonly branches:      Array<[IExpression, HTMLTemplateElement, ITemplateDescriptor]> = [];
    private readonly start:         Comment;
    private readonly subscriptions: Array<ISubscription>                                           = [];

    private currentDisposable: IDisposable|null = null;

    public constructor(scope: Scope, host: Node, templates: Array<HTMLTemplateElement>, branches: Array<IChoiceDirectiveBranch>)
    {
        super(scope, host);

        this.start = document.createComment("");
        this.end   = document.createComment("");

        assert(templates[0].parentNode);

        const parent = templates[0].parentNode;

        parent.replaceChild(this.end, templates[0]);
        parent.insertBefore(this.start, this.end);

        const notify = async () => await ParallelWorker.run(this.task.bind(this));

        const listener = { notify };

        for (let index = 0; index < branches.length; index++)
        {
            const branche = branches[index];

            this.subscriptions.push(ObserverVisitor.observe(scope, branche.expression, listener, true));

            this.branches.push([branche.expression, templates[index], branche.descriptor]);

            templates[index].remove();
        }

        this.fireAsync(notify);
    }

    public task(): void
    {
        this.currentDisposable?.dispose();
        this.currentDisposable = null;

        this.removeInRange(this.start, this.end);

        for (const [expression, template, descriptor] of this.branches)
        {
            if (expression.evaluate(this.scope))
            {
                const [content, disposable] = this.processTemplate(this.scope, this.host, template, descriptor, TemplateMetadata.from(this.start.parentNode!));

                this.currentDisposable = disposable;

                this.end.parentNode!.insertBefore(content, this.end);

                return;
            }
        }
    }

    public dispose(): void
    {
        this.currentDisposable?.dispose();

        this.subscriptions.forEach(x => x.unsubscribe());

        this.removeInRange(this.start, this.end);

        this.start.remove();
        this.end.remove();
    }
}