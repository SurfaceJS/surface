import { mixer }                                      from "@surface/core/common/object";
import CustomElement                                  from "@surface/custom-element";
import { attribute, computed, element, event, query } from "@surface/custom-element/decorators";
import colorable                                      from "../mixins/colorable";
import disableable                                    from "../mixins/disableable";
import elevatable                                     from "../mixins/elevatable";
import rippleable                                     from "../mixins/rippleable";
import themeable                                      from "../mixins/themeable";
import template                                       from "./index.html";
import style                                          from "./index.scss";

@element("smd-switch", template, style)
export class Switch extends mixer(CustomElement, [colorable, disableable, elevatable, rippleable, themeable])
{
    @query(".container")
    protected colorable!: HTMLElement;

    @query(".selection")
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

    @computed("inset", "label", "value")
    public get classes(): Record<string, boolean>
    {
        return { container: true, inset: this.inset, labelable: !!this.label, active: this.value };
    }

    @computed("themeClasses")
    public get labelClasses(): Record<string, boolean>
    {
        return { label: true, ...this.themeClasses };
    }

    @computed("themeClasses")
    public get selectionClasses(): Record<string, boolean>
    {
        return { selection: true, ...this.themeClasses };
    }

    @computed("flat", "themeClasses")
    public get thumbClasses(): Record<string, boolean>
    {
        return { thumb: true, "elevation-3": !this.flat, ...this.themeClasses };
    }

    @computed("themeClasses")
    public get trackClasses(): Record<string, boolean>
    {
        return { track: true, ...this.themeClasses };
    }
}