/* eslint-disable @typescript-eslint/prefer-readonly */
import type { IDisposable } from "@surface/core";
import { enumerateRange }   from "../common.js";
import { disposeTree }      from "../singletons.js";

export default class TemplateBlock implements IDisposable
{

    private close:    Comment;
    private disposed: boolean = false;
    private open:     Comment;

    public constructor()
    {
        this.open  = document.createComment("#open");
        this.close = document.createComment("#close");
    }

    private disconnect(): void
    {
        this.open.remove();
        this.close.remove();
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
            element.remove();

            disposeTree(element);
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
    }
}