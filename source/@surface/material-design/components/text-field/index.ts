import CustomElement         from "@surface/custom-element";
import { computed, element } from "@surface/custom-element/decorators";
import template              from "./index.html";
import style                 from "./index.scss";

@element("smd-text-field", template, style)
export default class TextField extends CustomElement
{
    public active: boolean = false;
    public value: string   = "";

    @computed("active", "value")
    public get classes(): Record<string, boolean>
    {
        return { active: this.active || !!this.value };
    }

    public constructor()
    {
        super();

        this.addEventListener("focus", () => this.active = true);
        this.addEventListener("focusout", () => this.active = false);
    }
}

declare global
{
    // tslint:disable-next-line:interface-name
    interface HTMLElementTagNameMap
    {
        "smd-text-field": TextField;
    }
}