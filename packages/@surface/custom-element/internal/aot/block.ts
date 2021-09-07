/* eslint-disable @typescript-eslint/prefer-readonly */
import type { IDisposable } from "@surface/core";
import { enumerateRange }   from "../common.js";
import { disposeTree }      from "../singletons.js";

const BLOCKS = Symbol("custom-element:block");

type Anchor = Comment & { [BLOCKS]: Set<Block> };

export default class Block implements IDisposable
{
    private disposed: boolean = false;
    private end:   Anchor;
    private start: Anchor;

    public constructor()
    {
        this.start = document.createComment("#start") as Anchor;
        this.end   = document.createComment("#end")   as Anchor;

        this.start[BLOCKS] = new Set([this]);
        this.end[BLOCKS]   = new Set([this]);
    }

    private isAnchor(node: Node & { [BLOCKS]?: Set<Block> }): node is Anchor
    {
        return !!node[BLOCKS];
    }

    private optimize(): void
    {
        const hasNestedDirective =
               this.start.nextSibling
            && this.start.nextSibling != this.end
            && this.isAnchor(this.start.nextSibling)
            && this.end.previousSibling
            && this.end.previousSibling != this.start
            && this.isAnchor(this.end.previousSibling);

        if (hasNestedDirective)
        {
            const nextStart      = this.start.nextSibling   as Anchor;
            const previousEnd = this.end.previousSibling as Anchor;

            const start = this.start;
            const end   = this.end;

            for (const block of start[BLOCKS].values())
            {
                block.start = nextStart;

                nextStart[BLOCKS].add(block);
            }

            for (const block of end[BLOCKS].values())
            {
                block.end = previousEnd;

                previousEnd[BLOCKS].add(block);
            }

            start.remove();
            end.remove();
        }
    }

    public connect(node: Node): void
    {
        node.appendChild(this.start);
        node.appendChild(this.end);
    }

    public clear(): void
    {
        for (const element of enumerateRange(this.start, this.end))
        {
            element.remove();

            disposeTree(element);
        }
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.clear();

            if (this.start[BLOCKS].size == 1)
            {
                this.start.remove();
            }
            else
            {
                this.start[BLOCKS].delete(this);
            }

            if (this.end[BLOCKS].size == 1)
            {
                this.end.remove();
            }
            else
            {
                this.end[BLOCKS].delete(this);
            }

            this.disposed = true;
        }
    }

    public setContent<T extends Node>(content: T, optimize: boolean = true): void
    {
        this.end.parentNode!.insertBefore(content, this.end);

        if (optimize)
        {
            this.optimize();
        }
    }
}