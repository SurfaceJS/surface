import { mixer }                                           from "@surface/core";
import CustomElement, { attribute, element, event, query } from "@surface/custom-element";
import { computed, observe }                               from "@surface/reactive";
import colorable                                           from "../../mixins/colorable";
import disableable                                         from "../../mixins/disableable";
import elevatable                                          from "../../mixins/elevatable";
import rippleable                                          from "../../mixins/rippleable";
import themeable                                           from "../../mixins/themeable";
import template                                            from "./index.html";
import style                                               from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-switch": Switch;
    }
}

@element("smd-switch", template, style)
export default class Switch extends mixer(CustomElement, [colorable, disableable, elevatable, rippleable, themeable])
{
    @query("#root")
    protected colorable!: HTMLElement;

    @query("#selection")
    protected rippleable!: HTMLElement;

    @attribute
    public checked: boolean = false;

    @attribute
    public flat: boolean = false;

    @attribute
    public inset: boolean = false;

    @attribute
    public label: string = "";

    @event("click")
    protected onClick(): void
    {
        this.checked = !this.checked;
    }

    @observe("checked")
    protected onChange(): void
    {
        super.dispatchEvent(new Event("change"));
    }

    @computed("checked", "elevationClasses", "themeClasses", "inset", "flat", "label")
    public get classes(): Record<string, boolean>
    {
        return {
            ...this.elevationClasses,
            ...this.themeClasses,
            checked:   this.checked,
            flat:      this.flat,
            inset:     this.inset,
            labelable: !!this.label,
        };
    }
}