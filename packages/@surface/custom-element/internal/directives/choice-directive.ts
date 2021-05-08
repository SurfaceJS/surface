import type { IDisposable }                              from "@surface/core";
import { CancellationTokenSource, assert }               from "@surface/core";
import type { Subscription }                             from "@surface/observer";
import { tryEvaluateExpression, tryObserveByObservable } from "../common.js";
import TemplateProcessor                                 from "../processors/template-processor.js";
import { scheduler }                                     from "../singletons.js";
import type ChoiceBranchDirectiveDescriptor              from "../types/choice-branch-directive-descriptor";
import type ChoiceDirectiveDescriptor                    from "../types/choice-directive-descriptor";
import type TemplateDirectiveContext                     from "../types/template-directive-context";
import type TemplateProcessorContext                     from "../types/template-processor-context";
import TemplateBlock                                     from "./template-block.js";

type Choice =
{
    branche:  ChoiceBranchDirectiveDescriptor,
    template: HTMLTemplateElement,
};

export default class ChoiceDirective implements IDisposable
{
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly context:                 TemplateDirectiveContext;
    private readonly choices:                 Choice[]                = [];
    private readonly subscriptions:           Subscription[]          = [];
    private readonly templateBlock:           TemplateBlock           = new TemplateBlock();

    private currentDisposable: IDisposable | null = null;
    private disposed: boolean                     = false;

    private currentChoice?: Choice;

    public constructor(templates: HTMLTemplateElement[], descriptor: ChoiceDirectiveDescriptor, context: TemplateDirectiveContext)
    {
        this.context = context;

        assert(templates[0].parentNode);

        const parent = templates[0].parentNode;

        this.templateBlock.insertAt(parent, templates[0]);

        const listener = (): void => void scheduler.enqueue(this.task, "normal", this.cancellationTokenSource.token);

        for (let index = 0; index < descriptor.branches.length; index++)
        {
            const branche  = descriptor.branches[index];
            const template = templates[index];

            this.subscriptions.push(tryObserveByObservable(context.scope, branche, listener, true));

            this.choices.push({ branche, template });

            template.remove();
        }

        listener();
    }

    private readonly task = (): void =>
    {
        for (const choice of this.choices)
        {
            if (tryEvaluateExpression(this.context.scope, choice.branche.expression, choice.branche.rawExpression, choice.branche.stackTrace))
            {
                if (choice != this.currentChoice)
                {
                    this.currentChoice = choice;

                    this.currentDisposable?.dispose();

                    this.templateBlock.clear();

                    const content =  choice.template.content.cloneNode(true);

                    const context: TemplateProcessorContext =
                    {
                        customDirectives:   this.context.customDirectives,
                        host:               this.context.host,
                        parentNode:         this.context.parentNode,
                        root:               content,
                        scope:              { ...this.context.scope },
                        templateDescriptor: choice.branche.descriptor,
                    };

                    const disposable = TemplateProcessor.process(context);

                    this.templateBlock.setContent(content);

                    this.currentDisposable = disposable;
                }

                return;
            }
        }

        this.currentDisposable?.dispose();

        this.templateBlock.clear();

        this.currentChoice = undefined;
    };

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