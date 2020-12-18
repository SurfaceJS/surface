/* eslint-disable @typescript-eslint/prefer-readonly */
import type { IDisposable } from "@surface/core";
import { enumerateRange }   from "../common.js";

const BLOCKS = Symbol("custom-element:template-blocks");

type Anchor = Comment & { [BLOCKS]: Set<TemplateBlock> };

export default class TemplateBlock implements IDisposable
{
    private close:    Anchor;
    private disposed: boolean = false;
    private open:     Anchor;

    public constructor()
    {
        this.open  = document.createComment("#open") as Anchor;
        this.close = document.createComment("#close") as Anchor;

        this.open[BLOCKS]  = new Set([this]);
        this.close[BLOCKS] = new Set([this]);
    }

    private isAnchor(node: Node & { [BLOCKS]?: Set<TemplateBlock> }): node is Anchor
    {
        return !!node[BLOCKS];
    }

    private disconnect(): void
    {
        if (this.open[BLOCKS].size == 1)
        {
            this.open.remove();
        }
        else
        {
            this.open[BLOCKS].delete(this);
        }

        if (this.close[BLOCKS].size == 1)
        {
            this.close.remove();
        }
        else
        {
            this.close[BLOCKS].delete(this);
        }
    }

    private optimize(): void
    {
        const hasNestedDirective =
               this.open.nextSibling
            && this.open.nextSibling != this.close
            && this.isAnchor(this.open.nextSibling)
            && this.close.previousSibling
            && this.close.previousSibling != this.open
            && this.isAnchor(this.close.previousSibling);

        if (hasNestedDirective)
        {
            const nextOpen      = this.open.nextSibling      as Anchor;
            const previousClose = this.close.previousSibling as Anchor;

            const open  = this.open;
            const close = this.close;

            for (const block of open[BLOCKS].values())
            {
                block.open = nextOpen;

                nextOpen[BLOCKS].add(block);
            }

            for (const block of close[BLOCKS].values())
            {
                block.close = previousClose;

                previousClose[BLOCKS].add(block);
            }

            open.remove();
            close.remove();
        }
    }

    public connect(node: Node): void
    {
        node.appendChild(this.open);
        node.appendChild(this.close);
    }

    public clear(): void
    {
        for (const element of enumerateRange(this.open, this.close))
        {
            element.dispose?.();

            element.remove();
        }
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.clear();
            this.disconnect();

            this.disposed = true;
        }
    }

    public insertAt(parent: Node & ParentNode, reference: Node): void
    {
        parent.replaceChild(this.close, reference);
        parent.insertBefore(this.open, this.close);
    }

    public setContent<T extends Node>(content: T): void
    {
        this.close.parentNode!.insertBefore(content, this.close);

        this.optimize();
    }
}