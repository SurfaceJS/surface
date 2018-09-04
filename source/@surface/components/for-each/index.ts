import { Nullable }           from "@surface/core";
import CustomElement          from "@surface/custom-element";
import Component              from "..";
import { attribute, element } from "../decorators";
import template               from "./index.html";

@element("surface-for-each", template)
export default class ForEach extends Component
{
    private _template: Nullable<HTMLTemplateElement>;
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

    private _of: Iterable<unknown> = [];
    public get of(): Iterable<unknown>
    {
        return this._of;
    }

    @attribute
    public set of(value: Iterable<unknown>)
    {
        this._of = value;

        this.changed();
    }

    public constructor()
    {
        super();
    }

    private changed(): void
    {
        if (this.template)
        {
            super.innerHTML = "";

            let index = 0;

            for (const item of this.of)
            {
                const fragment = document.importNode(this.template.content, true);

                CustomElement.contextBind({ ...super.context, index, item } as object, fragment); //TODO - Review binding order

                super.appendChild(fragment);

                index++;
            }
        }
    }

    protected attributeChangedCallback()
    {
        this.changed();
    }
}