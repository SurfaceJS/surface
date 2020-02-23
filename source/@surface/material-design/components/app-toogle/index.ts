import "../button";
import "../icon";

import { mixer }     from "@surface/core/common/object";
import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import colorable     from "../../mixins/colorable";
import elevatable    from "../../mixins/elevatable";
import themeable     from "../../mixins/themeable";
import template      from "./index.html";
import style         from "./index.scss";

@element("smd-app-toogle", template, style)
export default class AppToogle extends mixer(CustomElement, [colorable, elevatable, themeable])
{
    protected colorable?: HTMLElement;
}

declare global
{
    // tslint:disable-next-line:interface-name
    interface HTMLElementTagNameMap
    {
        "smd-app-toogle": AppToogle;
    }
}