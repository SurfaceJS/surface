import { mixer }                              from "@surface/core/common/object";
import CustomElement                          from "@surface/custom-element";
import { attribute, element, listen, notify } from "@surface/custom-element/decorators";
import colorable                              from "../mixins/colorable";
import disableable                            from "../mixins/disableable";
import elevatable                             from "../mixins/elevatable";
import rippleable                             from "../mixins/rippleable";
import themeable                              from "../mixins/themeable";
import template                               from "./index.html";
import style                                  from "./index.scss";

@element("smd-button", template, style)
export default class Button extends mixer(CustomElement, [colorable, disableable, elevatable, rippleable, themeable])
{
    @attribute
    @notify("classes")
    public block: boolean = false;

    @attribute
    @notify("classes")
    public fab: boolean = false;

    @attribute
    @notify("classes")
    public icon: boolean = false;

    @attribute
    @notify("classes")
    public rounded: boolean = false;

    @attribute
    @notify("classes")
    public outlined: boolean = false;

    @attribute
    @notify("classes")
    public text: boolean = false;

    @attribute
    @notify("classes")
    public tile: boolean = false;

    @listen("elevationClasses", "themeClasses")
    public get classes(): Record<string, boolean>
    {
        return {
            ...super.colorClasses,
            ...super.elevationClasses,
            ...super.rippleClasses,
            ...super.themeClasses,
            container: true,
            block:     this.block,
            fab:       this.fab,
            icon:      this.icon,
            outlined:  this.outlined,
            rounded:   this.rounded,
            text:      this.text,
            tile:      this.tile
        };
    }
}