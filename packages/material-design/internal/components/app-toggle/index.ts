/* eslint-disable import/no-unassigned-import */
import "../button/index.js";
import "../icon/index.js";

import { mix }                   from "@surface/core";
import HTMLXElement, { element } from "@surface/htmlx-element";
import colorable                 from "../../mixins/colorable/index.js";
import elevatable                from "../../mixins/elevatable/index.js";
import themeable                 from "../../mixins/themeable/index.js";
import template                  from "./index.htmlx";
import style                     from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-app-toggle": AppToggle;
    }
}

@element("smd-app-toggle", { style, template })
export default class AppToggle extends mix(HTMLXElement, [colorable, elevatable, themeable])
{
    public declare colorable: HTMLElement;
}
