import { mix }                                               from "@surface/core";
import HTMLXElement, { attribute, computed, element, query } from "@surface/htmlx-element";
import colorable                                             from "../../mixins/colorable/index.js";
import disableable                                           from "../../mixins/disableable/index.js";
import elevatable                                            from "../../mixins/elevatable/index.js";
import rippleable                                            from "../../mixins/rippleable/index.js";
import themeable                                             from "../../mixins/themeable/index.js";
import template                                              from "./index.htmlx";
import style                                                 from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-buttom": Button;
    }
}

export type Size = ""
| "x-small"
| "small"
| "medium"
| "large"
| "x-large";

@element("smd-button", { style, template })
export default class Button extends mix(HTMLXElement, [colorable, disableable, elevatable, rippleable, themeable])
{
    @query("#root")
    public declare colorable: HTMLElement;

    @query("#root")
    public declare rippleable: HTMLElement;

    @attribute(Boolean)
    public block: boolean = false;

    @attribute(Boolean)
    public fab: boolean = false;

    @attribute(Boolean)
    public icon: boolean = false;

    @attribute(Boolean)
    public rounded: boolean = false;

    @attribute
    public size: Size = "";

    @attribute(Boolean)
    public outlined: boolean = false;

    @attribute(Boolean)
    public text: boolean = false;

    @attribute(Boolean)
    public tile: boolean = false;

    @computed("block", "fab", "icon", "outlined", "rounded", "text", "tile", "elevationClasses", "themeClasses")
    public get classes(): Record<string, boolean>
    {
        return {
            ...super.elevationClasses,
            ...super.themeClasses,
            block:      this.block,
            container:  true,
            fab:        this.fab,
            icon:       this.icon,
            outlined:   this.outlined,
            rounded:    this.rounded,
            text:       this.text,
            tile:       this.tile,
        };
    }
}
