import { CancellationTokenSource, IDisposable, assert }  from "@surface/core";
import { Subscription }                                  from "@surface/reactive";
import { tryEvaluateExpression, tryObserveByObservable } from "../../common";
import IChoiceBranchDirective                            from "../../interfaces/choice-branch-directive";
import { scheduler }                                     from "../../singletons";
import TemplateBlock                                     from "../template-block";
import TemplateDirectiveHandler                          from "./template-directive-handler";

type Choice =
{
    branche:  IChoiceBranchDirective,
    template: HTMLTemplateElement,
};

export default class ChoiceDirectiveHandler extends TemplateDirectiveHandler
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly choices:                 Choice[]                = [];
    private readonly subscriptions:           Subscription[]          = [];
    private readonly templateBlock:           TemplateBlock           = new TemplateBlock();

    private currentDisposable: IDisposable | null = null;
    private disposed: boolean                     = false;

    public constructor(scope: object, context: Node, host: Node, templates: HTMLTemplateElement[], branches: IChoiceBranchDirective[])
    {
        super(scope, context, host);

        assert(templates[0].parentNode);

        const parent = templates[0].parentNode;

        this.templateBlock.insertAt(parent, templates[0]);

        const listener = (): void => void scheduler.enqueue(this.task.bind(this), "normal", this.cancellationTokenSource.token);

        for (let index = 0; index < branches.length; index++)
        {
            const branche  = branches[index];
            const template = templates[index];

            this.subscriptions.push(tryObserveByObservable(scope, branche, listener, true));

            this.choices.push({ branche, template });

            template.remove();
        }

        listener();
    }

    private task(): void
    {
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
            this.cancellationTokenSource.cancel();
            this.currentDisposable?.dispose();

            this.subscriptions.forEach(x => x.unsubscribe());

            this.templateBlock.clear();
            this.templateBlock.dispose();

            this.disposed = true;
        }
    }
}