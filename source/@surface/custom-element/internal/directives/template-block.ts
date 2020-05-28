import { IDisposable }    from "@surface/core";
import Metadata           from "@surface/reactive/internal/metadata";
import { enumerateRange } from "../common";

const BLOCKS = Symbol("custom-element:template-blocks");

type Anchor = Comment & { [BLOCKS]: Set<TemplateBlock> };

export default class TemplateBlock implements IDisposable
{
    private _close: Anchor;
    private _open:  Anchor;

    private disposed: boolean = false;

    public get close(): Anchor
    {
        return this._close;
    }

    public get open(): Anchor
    {
        return this._open;
    }

    public constructor()
    {
        this._open  = document.createComment("#open") as Anchor;
        this._close = document.createComment("#close") as Anchor;

        this._open[BLOCKS]  = new Set([this]);
        this._close[BLOCKS] = new Set([this]);
    }

    public static isShared(anchor: Anchor): boolean
    {
        return anchor[BLOCKS].size > 1;
    }

    private isAnchor(node: Node & { [BLOCKS]?: Set<TemplateBlock> }): node is Anchor
    {
        return !!node[BLOCKS];
    }

    private disconnect(): void
    {
        if (this._open[BLOCKS].size == 1)
        {
            this._open.remove();
        }
        else
        {
            this._open[BLOCKS].delete(this);
        }

        if (this._close[BLOCKS].size == 1)
        {
            this._close.remove();
        }
        else
        {
            this._close[BLOCKS].delete(this);
        }
    }

    private optimize(): void
    {
        const hasNestedDirective =
               this._open.nextSibling
            && this._open.nextSibling != this._close
            && this.isAnchor(this._open.nextSibling)
            && this._close.previousSibling
            && this._close.previousSibling != this._open
            && this.isAnchor(this._close.previousSibling);

        if (hasNestedDirective)
        {
            const nextOpen      = this._open.nextSibling      as Anchor;
            const previousClose = this._close.previousSibling as Anchor;

            const open  = this._open;
            const close = this._close;

            for (const host of open[BLOCKS].values())
            {
                host._open = nextOpen;

                nextOpen[BLOCKS].add(host);
            }

            for (const host of close[BLOCKS].values())
            {
                host._close = previousClose;

                previousClose[BLOCKS].add(host);
            }

            open.remove();
            close.remove();
        }
    }

    public connect(node: Node): void
    {
        node.appendChild(this._open);
        node.appendChild(this._close);
    }

    public clear(): void
    {
        for (const element of enumerateRange(this._open, this._close))
        {
            Metadata.of(element)?.disposables.forEach(x => x.dispose());

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

    public insertAt(parent: Node & ParentNode, reference: Node)
    {
        parent.replaceChild(this._close, reference);
        parent.insertBefore(this._open, this._close);
    }

    public makeSingleUser(): void
    {
        if (this._open[BLOCKS].size > 1)
        {
            this._open[BLOCKS].delete(this);

            const start = document.createComment("#open") as Anchor;

            start[BLOCKS] = new Set([this]);

            this._open = start;
        }

        if (this._close[BLOCKS].size > 1)
        {
            this._close[BLOCKS].delete(this);

            const end = document.createComment("#close") as Anchor;

            end[BLOCKS] = new Set([this]);

            this._close = end;
        }
    }

    public setContent<T extends Node>(content: T): void
    {
        this._close.parentNode!.insertBefore(content, this._close);

        this.optimize();
    }
}