import { mixer }           from "@surface/core/common/object";
import CustomElement       from "@surface/custom-element";
import { element, listen } from "@surface/custom-element/decorators";
import colorable           from "../mixins/colorable";
import elevationable       from "../mixins/elevatable";
import themeable           from "../mixins/themeable";
import template            from "./index.html";
import style               from "./index.scss";

@element("smd-app-bar", template, style)
export default class AppBar extends mixer(CustomElement, [colorable, elevationable, themeable])
{
    @listen("elevationClasses", "themeClasses")
    public get classes(): Record<string, boolean>
    {
        return {
            ...super.colorClasses,
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