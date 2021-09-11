import { CancellationTokenSource }        from "@surface/core";
import type { IDisposable, Subscription } from "@surface/core";
import { scheduler }                      from "../../singletons.js";
import type DirectiveEntry                from "../../types/directive-entry";
import { tryEvaluate, tryObserve }        from "../common.js";
import type ChoiceBranch                  from "../types/choice-branch";
import type Block                         from "./block.js";

type Context =
{
    block:      Block,
    branches:   ChoiceBranch[],
    directives: Map<string, DirectiveEntry>,
    host:       Node,
    parent:     Node,
    scope:      object,
};

const EVALUATOR   = 0;
const OBSERVABLES = 1;
const FACTORY     = 2;
const SOURCE      = 3;
const STACK_TRACE = 4;

export default class ChoiceStatement implements IDisposable
{
    private readonly cancellationTokenSource:  CancellationTokenSource = new CancellationTokenSource();
    private readonly subscriptions:            Subscription[]          = [];

    private currentDisposable: IDisposable | null = null;
    private disposed:          boolean            = false;

    private currentBranch?: ChoiceBranch;

    public constructor(private readonly context: Context)
    {
        const listener = (): void => void scheduler.enqueue(this.task, "normal", this.cancellationTokenSource.token);

        for (const branch of this.context.branches)
        {
            this.subscriptions.push(tryObserve(context.scope, branch[OBSERVABLES], () => listener(), true, branch[SOURCE], branch[STACK_TRACE]));
        }

        listener();
    }

    private readonly task = (): void =>
    {
        for (const branch of this.context.branches)
        {
            if (tryEvaluate(this.context.scope, branch[EVALUATOR], branch[SOURCE], branch[STACK_TRACE]))
            {
                if (branch != this.currentBranch)
                {
                    this.currentBranch = branch;

                    this.currentDisposable?.dispose();

                    this.context.block.clear();

                    const [content, activator] = branch[FACTORY]();

                    this.context.block.setContent(content);

                    this.currentDisposable = activator(this.context.parent, this.context.host, this.context.scope, this.context.directives);
                }

                return;
            }
        }

        this.currentDisposable?.dispose();

        this.context.block.clear();

        this.currentBranch = undefined;
    };

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.cancellationTokenSource.cancel();
            this.currentDisposable?.dispose();

            this.subscriptions.forEach(x => x.unsubscribe());

            this.context.block.dispose();

            this.disposed = true;
        }
    }
}
