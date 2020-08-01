import { assert, IDisposable }                           from "@surface/core";
import { ISubscription }                                 from "@surface/reactive";
import { tryEvaluateExpression, tryObserveByObservable } from "../../common";
import IChoiceBranchDirective                            from "../../interfaces/directives/choice-branch-directive";
import ParallelWorker                                    from "../../parallel-worker";
import TemplateBlock                                     from "../template-block";
import TemplateDirectiveHandler                          from "./";

type Choice =
{
    branche:  IChoiceBranchDirective;
    template: HTMLTemplateElement;
};

export default class ChoiceDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly choices:       Array<Choice>        = [];
    private readonly subscriptions: Array<ISubscription> = [];
    private readonly templateBlock: TemplateBlock        = new TemplateBlock();

    private currentDisposable: IDisposable|null = null;
    private disposed:          boolean          = false;


    public constructor(scope: object, context: Node, host: Node, templates: Array<HTMLTemplateElement>, branches: Array<IChoiceBranchDirective>)
    {
        super(scope, context, host);

        assert(templates[0].parentNode);

        const parent = templates[0].parentNode;

        this.templateBlock.insertAt(parent, templates[0]);

        const notify = async () => await ParallelWorker.run(this.task.bind(this));

        for (let index = 0; index < branches.length; index++)
        {
            const listener = { notify };

            const branche  = branches[index];
            const template = templates[index];

            this.subscriptions.push(tryObserveByObservable(scope, branche, listener, true));

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

        this.templateBlock.clear();

        for (const choice of this.choices)
        {
            if (tryEvaluateExpression(this.scope, choice.branche.expression, choice.branche.rawExpression, choice.branche.stackTrace))
            {
                const [content, disposable] = this.processTemplate(this.scope, this.context, this.host, choice.template, choice.branche.descriptor);

                this.currentDisposable = disposable;

                this.templateBlock.setContent(content);

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

            this.templateBlock.clear();
            this.templateBlock.dispose();

            this.disposed = true;
        }
    }
}