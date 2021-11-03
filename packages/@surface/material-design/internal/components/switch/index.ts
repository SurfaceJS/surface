import { mix }                                                                from "@surface/core";
import HTMLXElement, { attribute, computed, element, event, listener, query } from "@surface/htmlx-element";
import colorable                                                              from "../../mixins/colorable/index.js";
import disableable                                                            from "../../mixins/disableable/index.js";
import elevatable                                                             from "../../mixins/elevatable/index.js";
import rippleable                                                             from "../../mixins/rippleable/index.js";
import themeable                                                              from "../../mixins/themeable/index.js";
import template                                                               from "./index.htmlx";
import style                                                                  from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-switch": Switch;
    }
}

@element("smd-switch", { style, template })
export default class Switch extends mix(HTMLXElement, [colorable, disableable, elevatable, rippleable, themeable])
{
    @query("#root")
    public colorable!: HTMLElement;

    @query("#selection")
    public rippleable!: HTMLElement;

    @attribute(Boolean)
    public checked: boolean = false;

    @attribute(Boolean)
    public flat: boolean = false;

    @attribute(Boolean)
    public inset: boolean = false;

    @attribute
    public label: string = "";

    @event("click")
    protected onClick(): void
    {
        this.checked = !this.checked;
    }

    @listener("checked")
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