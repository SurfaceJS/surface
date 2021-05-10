import { mix }                                     from "@surface/core";
import CustomElement, { computed, element, query } from "@surface/custom-element";
import colorable                                   from "../../mixins/colorable/index.js";
import elevationable                               from "../../mixins/elevatable/index.js";
import themeable                                   from "../../mixins/themeable/index.js";
import template                                    from "./index.html";
import style                                       from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-footer": Footer;
    }
}

@element("smd-footer", template, style)
export default class Footer extends mix(CustomElement, [colorable, elevationable, themeable])
{
    @query("#root")
    public colorable!: HTMLElement;

    @computed("elevationClasses", "themeClasses")
    public get classes(): Record<string, boolean>
    {
        return {
            ...super.elevationClasses,
            ...super.themeClasses,
        };
    }

    public constructor()
    {
        super();

        this.elevation = 3;
    }
}