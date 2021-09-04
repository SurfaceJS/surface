
import { CancellationTokenSource, DisposableMetadata } from "@surface/core";
import type { Delegate, IDisposable, Subscription }    from "@surface/core";
import { scheduler }                                   from "../../singletons.js";
import type { DirectiveEntry }                         from "../../types/index";
import Block                                           from "../block.js";
import observe                                         from "../observe.js";
import type DestructuredEvaluator                      from "../types/destructured-evaluator";
import type Evaluator                                  from "../types/evaluator";
import type NodeFactory                                from "../types/node-fatctory";
import type ObservablePath                             from "../types/observable-path";

type Context =
{
    block:       Block,
    directives:  Map<string, DirectiveEntry>,
    factory:     NodeFactory,
    host:        Node,
    left:        DestructuredEvaluator,
    observables: ObservablePath[],
    operator:    "in" | "of",
    parent:      Node,
    right:       Evaluator,
    scope:       object,
};

type CacheEntry = [unknown, Block, IDisposable];

class Cache
{
    private readonly entries: CacheEntry[] = [];

    private changed: boolean = false;
    private cursor:  number  = 0;
    private stored:  number  = 0;

    public trim(): void
    {
        if (this.stored > 0)
        {
            this.entries.splice(this.cursor, this.stored - this.cursor).forEach(x => (x[2].dispose(), x[1].dispose()));

            this.stored = 0;
        }
    }

    public add(value: unknown, block: Block, disposable: IDisposable): void
    {
        this.entries.push([value, block, disposable]);
    }

    public hasChanges(index: number, value: unknown): boolean
    {
        if (this.changed || !Object.is(value, this.entries[index]?.[0]))
        {
            if (!this.changed)
            {
                this.changed = true;
                this.cursor  = index;
            }

            return true;
        }

        return false;
    }

    public resize(size: number): void
    {
        if (!this.changed)
        {
            this.cursor = size;
        }

        this.trim();

        this.changed = false;
        this.cursor  = 0;
        this.stored  = size;
    }
}

export default class LoopStatement implements IDisposable
{
    private static readonly maximumAmount: number = 1000;

    private readonly cache:                   Cache                   = new Cache();
    private readonly cancellationTokenSource: CancellationTokenSource = new CancellationTokenSource();
    private readonly iterator:                (elements: Iterable<unknown>, action: Delegate<[unknown, number]>) => number;
    private readonly subscription:            Subscription;
    private readonly tree:                    DocumentFragment;

    private disposed: boolean = false;

    public constructor(private readonly context: Context)
    {
        this.tree = document.createDocumentFragment();

        this.iterator = this.context.operator == "in" ? this.forInIterator : this.forOfIterator;

        const listener = (): void => void scheduler.enqueue(this.task, "normal", this.cancellationTokenSource.token);

        this.subscription = observe(context.scope, context.observables, listener, true);

        listener();
    }

    private action(value: unknown, index: number): void
    {
        if (this.cache.hasChanges(index, value))
        {
            const directiveScope = this.context.left(this.context.scope, value);
            const scope          = { $index: index, ...this.context.scope, ...directiveScope };

            const [content, activator] = this.context.factory();

            const disposables = [activator(this.context.parent, this.context.host, scope, this.context.directives), DisposableMetadata.from(scope)];

            const disposable = { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
            const block      = new Block();

            this.cache.add(value, block, disposable);

            block.connect(this.tree);

            block.setContent(content);

            const count = index + 1;

            if (Math.ceil(count / LoopStatement.maximumAmount) * LoopStatement.maximumAmount == count)
            {
                this.cache.trim();

                this.context.block.setContent(this.tree, false);
            }
        }
    }

    private forOfIterator(elements: Iterable<unknown>): number
    {
        let index = 0;

        for (const element of elements)
        {
            const current = index++;

            void scheduler.enqueue(() => this.action(element, current), "high", this.cancellationTokenSource.token);
        }

        return index;
    }

    private forInIterator(elements: Iterable<unknown>): number
    {
        let index = 0;

        for (const element in elements)
        {
            const current = index++;

            void scheduler.enqueue(() => this.action(element, current), "high", this.cancellationTokenSource.token);
        }

        return index;
    }

    private readonly task = (): void =>
    {
        if (this.disposed)
        {
            return;
        }

        const elements = this.context.right(this.context.scope) as Iterable<unknown>;

        if (elements[Symbol.iterator]().next().done)
        {
            this.cache.resize(0);
        }
        else
        {
            const size = this.iterator(elements, this.action);

            const task = (): void =>
            {
                this.cache.resize(size);

                this.context.block.setContent(this.tree, false);
            };

            void scheduler.enqueue(task, "high", this.cancellationTokenSource.token);
        }
    };

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.cancellationTokenSource.cancel();

            this.cache.resize(0);

            this.subscription.unsubscribe();
            this.context.block.dispose();

            this.disposed = true;
        }
    }
}
