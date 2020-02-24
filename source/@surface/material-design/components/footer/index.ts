import { mixer }                    from "@surface/core/common/object";
import CustomElement                from "@surface/custom-element";
import { computed, element, query } from "@surface/custom-element/decorators";
import colorable                    from "../../mixins/colorable";
import elevationable                from "../../mixins/elevatable";
import themeable                    from "../../mixins/themeable";
import template                     from "./index.html";
import style                        from "./index.scss";

@element("smd-footer", template, style)
export default class Footer extends mixer(CustomElement, [colorable, elevationable, themeable])
{
    @query("#root")
    protected colorable!: HTMLElement;

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

declare global
{
    // tslint:disable-next-line:interface-name
    interface HTMLElementTagNameMap
    {
        "smd-footer": Footer;
    }
}