import { mixer }                                               from "@surface/core/common/object";
import CustomElement                                           from "@surface/custom-element";
import { attribute, computed, element, event, observe, query } from "@surface/custom-element/decorators";
import colorable                                               from "../../mixins/colorable";
import disableable                                             from "../../mixins/disableable";
import elevatable                                              from "../../mixins/elevatable";
import rippleable                                              from "../../mixins/rippleable";
import themeable                                               from "../../mixins/themeable";
import template                                                from "./index.html";
import style                                                   from "./index.scss";

@element("smd-switch", template, style)
export class Switch extends mixer(CustomElement, [colorable, disableable, elevatable, rippleable, themeable])
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
    protected onChange(_value: boolean)
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

declare global
{
    // tslint:disable-next-line:interface-name
    interface HTMLElementTagNameMap
    {
        "smd-switch": Switch;
    }
}