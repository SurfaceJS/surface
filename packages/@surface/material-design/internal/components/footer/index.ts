import { mix }                                    from "@surface/core";
import HTMLXElement, { computed, element, query } from "@surface/htmlx-element";
import colorable                                  from "../../mixins/colorable/index.js";
import elevationable                              from "../../mixins/elevatable/index.js";
import themeable                                  from "../../mixins/themeable/index.js";
import template                                   from "./index.htmlx";
import style                                      from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-footer": Footer;
    }
}

@element("smd-footer", { style, template })
export default class Footer extends mix(HTMLXElement, [colorable, elevationable, themeable])
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