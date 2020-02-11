import { mixer }                    from "@surface/core/common/object";
import CustomElement                from "@surface/custom-element";
import { computed, element, query } from "@surface/custom-element/decorators";
import colorable                    from "../mixins/colorable";
import elevationable                from "../mixins/elevatable";
import themeable                    from "../mixins/themeable";
import template                     from "./index.html";
import style                        from "./index.scss";

@element("smd-app-bar", template, style)
export default class AppBar extends mixer(CustomElement, [colorable, elevationable, themeable])
{
    @query(".container")
    protected colorable!: HTMLElement;

    @computed("elevationClasses", "themeClasses")
    public get classes(): Record<string, boolean>
    {
        return {
            ...super.elevationClasses,
            ...super.themeClasses,
            container: true,
        };
    }

    public constructor()
    {
        super();

        this.elevation = 5;
    }
}