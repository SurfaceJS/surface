import { attribute, element, notify } from "@surface/custom-element/decorators";
import Component                      from "..";
import { rippleMixin }                from "../internal/mixins/ripple";
import template                       from "./index.html";
import style                          from "./index.scss";

@element("surface-button", template, style)
export default class Button extends rippleMixin(Component)
{
    @attribute
    @notify("classes")
    public fab: boolean = false;

    @attribute
    @notify("classes")
    public flat: boolean = false;

    @attribute
    @notify("classes")
    public icon: boolean = false;

    @attribute
    @notify("classes")
    public rounded: boolean = false;

    @attribute
    @notify("classes")
    public outlined: boolean = false;

    protected get classes(): object
    {
        return { fab: this.fab, flat: this.flat, icon: this.icon, rounded: this.rounded, outlined: this.outlined };
    }

    public constructor()
    {
        super();
    }
}