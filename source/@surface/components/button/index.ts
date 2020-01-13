import { attribute, element, notify } from "@surface/custom-element/decorators";
import Component                      from "..";
import Ripple                         from "../internal/mixins/ripple";
import template                       from "./index.html";
import style                          from "./index.scss";

@element("surface-button", template, style)
export default class Button extends Ripple(Component)
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
            block:    this.block,
            fab:      this.fab,
            icon:     this.icon,
            outlined: this.outlined,
            rounded:  this.rounded,
            text:     this.text,
            tile:     this.tile
        };
    }
}