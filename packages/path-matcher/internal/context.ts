import type ContextType from "./context-type.js";

export type Pending = { index: number, rollback: string };

export const last = <T>(elements: T[]): T | undefined => elements[elements.length - 1];

export default class Context
{
    private readonly start: number;

    public readonly tokens: string[];
    public readonly pending: Pending[] = [];
    public readonly parent?: Context;
    public readonly children: Context[] = [];

    public rolledBack: boolean = false;

    public constructor(public readonly type: ContextType, parent?: Context)
    {
        this.parent = parent;

        this.tokens = this.parent?.tokens ?? [];
        this.parent?.children.push(this);

        this.start = this.tokens.length;
    }

    public discard(): void
    {
        this.children.forEach(x => x.discard());

        this.tokens.splice(this.start);
    }

    public inside(context: ContextType, depth: number = Number.MAX_VALUE): boolean
    {
        return !!this.lookup(context, depth);
    }

    public lookup(context: ContextType, depth: number = Number.MAX_VALUE): Context | null
    {
        if (this.type != context)
        {
            let parent = this.parent;

            let index = 0;

            while (parent && index < depth)
            {
                if (parent.type == context)
                {
                    return parent;
                }

                parent = parent.parent;
                index++;
            }

            return null;
        }

        return this;
    }

    public push(token: string, rollback?: string): void
    {
        this.tokens.push(token);

        if (rollback != undefined)
        {
            this.pending.push({ index: this.tokens.length - 1, rollback });
        }
    }

    public rollback(recursive: boolean = false): void
    {
        for (const token of this.pending)
        {
            this.tokens[token.index] = token.rollback;
        }

        this.rolledBack = true;

        if (recursive)
        {
            this.children.forEach(x => x.rollback(recursive));
        }
    }
}
