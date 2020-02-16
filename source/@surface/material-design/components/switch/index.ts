import { mixer }                                      from "@surface/core/common/object";
import CustomElement                                  from "@surface/custom-element";
import { attribute, computed, element, event, query } from "@surface/custom-element/decorators";
import colorable                                      from "../../mixins/colorable";
import disableable                                    from "../../mixins/disableable";
import elevatable                                     from "../../mixins/elevatable";
import rippleable                                     from "../../mixins/rippleable";
import themeable                                      from "../../mixins/themeable";
import template                                       from "./index.html";
import style                                          from "./index.scss";

@element("smd-switch", template, style)
export class Switch extends mixer(CustomElement, [colorable, disableable, elevatable, rippleable, themeable])
{
    @query("#container")
    protected colorable!: HTMLElement;

    @query("#selection")
    protected rippleable!: HTMLElement;

    @attribute
    public flat: boolean = false;

    @attribute
    public inset: boolean = false;

    @attribute
    public label: string = "";

    @attribute
    public value: boolean = false;

    @event("click")
    protected onClick(): void
    {
        this.value = !this.value;
    }

    @computed("elevationClasses", "themeClasses", "inset", "flat", "label", "value")
    public get classes(): Record<string, boolean>
    {
        return {
            ...this.elevationClasses,
            ...this.themeClasses,
            active:    this.value,
            flat:      this.flat,
            inset:     this.inset,
            labelable: !!this.label,
        };
    }
}