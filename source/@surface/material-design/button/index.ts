import { attribute, element, notify } from "@surface/custom-element/decorators";
import Component                      from "..";
import Colorable                      from "../internal/mixins/colorable";
import Rippleable                     from "../internal/mixins/rippleable";
import template                       from "./index.html";
import style                          from "./index.scss";

@element("smd-button", template, style)
export default class Button extends Rippleable(Colorable(Component))
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

    public get classes(): Record<string, boolean>
    {
        return {
            ...super.classes,
            container:  true,
            block:      this.block,
            fab:        this.fab,
            icon:       this.icon,
            outlined:   this.outlined,
            rounded:    this.rounded,
            text:       this.text,
            tile:       this.tile
        };
    }
}