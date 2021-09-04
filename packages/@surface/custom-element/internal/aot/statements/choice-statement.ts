import { CancellationTokenSource }        from "@surface/core";
import type { IDisposable, Subscription } from "@surface/core";
import { scheduler }                      from "../../singletons.js";
import type { DirectiveEntry }            from "../../types/index";
import type Block                         from "../block.js";
import observe                            from "../observe.js";
import type BranchStatement               from "../types/branch-statement";

type Context =
{
    block:      Block,
    branches:   BranchStatement[],
    directives: Map<string, DirectiveEntry>,
    host:       Node,
    parent:     Node,
    scope:      object,
};

const EXPRESSION  = 0;
const OBSERVABLES = 1;
const FACTORY     = 2;

export default class ChoiceStatement implements IDisposable
{
    private readonly cancellationTokenSource:  CancellationTokenSource = new CancellationTokenSource();
    private readonly subscriptions:            Subscription[]          = [];

    private currentDisposable: IDisposable | null = null;
    private disposed:          boolean            = false;

    private currentBranch?: BranchStatement;

    public constructor(private readonly context: Context)
    {
        const listener = (): void => void scheduler.enqueue(this.task, "normal", this.cancellationTokenSource.token);

        for (const branch of this.context.branches)
        {
            this.subscriptions.push(observe(context.scope, branch[OBSERVABLES], () => listener(), true));
        }

        listener();
    }

    private readonly task = (): void =>
    {
        for (const branch of this.context.branches)
        {
            if (branch[EXPRESSION](this.context.scope))
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
