/* eslint-disable import/no-unassigned-import */
import "../button";
import "../icon";

import { mixer }                  from "@surface/core";
import CustomElement, { element } from "@surface/custom-element";
import colorable                  from "../../mixins/colorable";
import elevatable                 from "../../mixins/elevatable";
import themeable                  from "../../mixins/themeable";
import template                   from "./index.html";
import style                      from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-app-toogle": AppToogle;
    }
}

@element("smd-app-toogle", template, style)
export default class AppToogle extends mixer(CustomElement, [colorable, elevatable, themeable])
{
    protected colorable?: HTMLElement;
}