import { assert }                from "@surface/core/common/generic";
import IDisposable               from "@surface/core/interfaces/disposable";
import ISubscription             from "@surface/reactive/interfaces/subscription";
import { tryEvaluateExpression } from "../../common";
import DataBind                  from "../../data-bind";
import IChoiceDirectiveBranch    from "../../interfaces/choice-directive-branch";
import ParallelWorker            from "../../parallel-worker";
import { Scope }                 from "../../types";
import TemplateDirectiveHandler  from "./";

type Choice =
{
    branche:  IChoiceDirectiveBranch;
    template: HTMLTemplateElement;
};

export default class ChoiceDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly choices:       Array<Choice> = [];
    private readonly end:           Comment;
    private readonly start:         Comment;
    private readonly subscriptions: Array<ISubscription> = [];

    private currentDisposable: IDisposable|null = null;
    private disposed:          boolean          = false;

    public constructor(scope: Scope, context: Node, host: Node, templates: Array<HTMLTemplateElement>, branches: Array<IChoiceDirectiveBranch>)
    {
        super(scope, context, host);

        this.start = document.createComment("");
        this.end   = document.createComment("");

        assert(templates[0].parentNode);

        const parent = templates[0].parentNode;

        parent.replaceChild(this.end, templates[0]);
        parent.insertBefore(this.start, this.end);

        const notify = async () => await ParallelWorker.run(this.task.bind(this));

        for (let index = 0; index < branches.length; index++)
        {
            const listener = { notify };

            const branche  = branches[index];
            const template = templates[index];

            this.subscriptions.push(DataBind.observe(scope, branche.observables, listener, true));

            this.choices.push({ branche, template });

            template.remove();
        }

        this.fireAsync(notify);
    }

    private task(): void
    {
        if (this.disposed)
        {
            return;
        }

        this.currentDisposable?.dispose();
        this.currentDisposable = null;

        this.removeInRange(this.start, this.end);

        for (const choice of this.choices)
        {
            if (tryEvaluateExpression(this.scope, choice.branche.expression, choice.branche.stackTrace))
            {
                const [content, disposable] = this.processTemplate(this.scope, this.context, this.host, choice.template, choice.branche.descriptor);

                this.currentDisposable = disposable;

                this.end.parentNode!.insertBefore(content, this.end);

                return;
            }
        }
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.currentDisposable?.dispose();

            this.subscriptions.forEach(x => x.unsubscribe());

            this.removeInRange(this.start, this.end);

            this.start.remove();
            this.end.remove();

            this.disposed = true;
        }
    }
}