import { Nullable }  from "@surface/core";
import CustomElement from "@surface/custom-element";
import Enumerable    from "@surface/enumerable";
import Component     from "..";
import { element }   from "../decorators";
import template      from "./index.html";

@element("surface-for-each", template)
export default class ForEach extends Component
{
    private _of:       Iterable<unknown> = [];
    private _template: Nullable<HTMLTemplateElement>;

    public get end(): number
    {
        return Number.parseInt(super.getAttribute("end") || "0") || 0;
    }

    public set end(value: number)
    {
        if (value != this.end)
        {
            super.setAttribute("end", value.toString());

            if (this.end >= this.start)
            {
                this.changed();
            }
        }
    }

    public get of(): Iterable<unknown>
    {
        return this._of;
    }

    public set of(value: Iterable<unknown>)
    {
        if (value != this.of)
        {
            this._of = value;

            this.changed();
        }
    }

    public get start(): number
    {
        return Number.parseInt(super.getAttribute("start") || "0") || 0;
    }

    public set start(value: number)
    {
        if (value != this.start)
        {
            super.setAttribute("start", value.toString());

            if (this.end >= this.start)
            {
                this.changed();
            }
        }
    }

    public get template(): Nullable<HTMLTemplateElement>
    {
        if (!this._template)
        {
            this._template = this.query("template");

            if (this._template)
            {
                super.removeChild(this._template);
            }
        }

        return this._template;
    }

    public constructor()
    {
        super();

        super.bindedCallback = this.changed.bind(this);
    }

    private changed(): void
    {
        if (this.template)
        {
            CustomElement.contextUnbind(this);
            super.innerHTML = "";

            let sequence = Enumerable.from(this.of);

            if (sequence.any())
            {
                if (this.end > 0)
                {
                    sequence = sequence.take(this.end + 1);
                }

                if (this.start > 0)
                {
                    sequence = sequence.skip(this.start);
                }
            }
            else if (this.end > 0)
            {
                console.log("changed");
                sequence = Enumerable.range(this.start, this.end) as Enumerable<unknown>;
            }

            let index = this.start;

            for (const item of sequence)
            {
                const fragment = document.importNode(this.template.content, true);

                CustomElement.contextBind({ ...super.context, index, item } as object, fragment); //TODO - Review binding order

                super.appendChild(fragment);

                index++;
            }
        }
    }

    protected connectedCallback(): void
    {
        this.changed();
    }
}