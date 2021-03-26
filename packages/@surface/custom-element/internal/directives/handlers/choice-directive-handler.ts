import type { IDisposable }                                           from "@surface/core";
import { CancellationTokenSource, DisposableMetadata, assert }        from "@surface/core";
import type { Subscription }                                          from "@surface/reactive";
import { inheritScope, tryEvaluateExpression, tryObserveByObservable } from "../../common.js";
import type IChoiceBranchDirective                                    from "../../interfaces/choice-branch-directive";
import { scheduler }                                                  from "../../singletons.js";
import TemplateBlock                                                  from "../template-block.js";
import TemplateDirectiveHandler                                       from "./template-directive-handler.js";

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

    private currentChoice?: Choice;

    public constructor(scope: object, context: Node, host: Node, templates: HTMLTemplateElement[], branches: IChoiceBranchDirective[])
    {
        super(inheritScope(scope), context, host);

        assert(templates[0].parentNode);

        const parent = templates[0].parentNode;

        this.templateBlock.insertAt(parent, templates[0]);

        const listener = (): void => void scheduler.enqueue(this.task.bind(this), "normal", this.cancellationTokenSource.token);

        for (let index = 0; index < branches.length; index++)
        {
            const branche  = branches[index];
            const template = templates[index];

            this.subscriptions.push(tryObserveByObservable(this.scope, branche, listener, true));

            this.choices.push({ branche, template });

            template.remove();
        }

        listener();
    }

    private task(): void
    {
        for (const choice of this.choices)
        {
            if (tryEvaluateExpression(this.scope, choice.branche.expression, choice.branche.rawExpression, choice.branche.stackTrace))
            {
                if (choice != this.currentChoice)
                {
                    this.currentChoice = choice;

                    this.currentDisposable?.dispose();

                    this.templateBlock.clear();

                    const [content, disposable] = this.processTemplate({ ...this.scope }, this.context, this.host, choice.template, choice.branche.descriptor);

                    this.templateBlock.setContent(content);

                    this.currentDisposable = disposable;
                }

                return;
            }
        }

        this.currentDisposable?.dispose();

        this.templateBlock.clear();

        this.currentChoice = undefined;
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
            DisposableMetadata.from(this.scope).dispose();

            this.disposed = true;
        }
    }
}