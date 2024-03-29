// eslint-disable-next-line import/no-unassigned-import
import "./root.scss?style";

import HTMLXElement, { element } from "@surface/htmlx-element";
import template                  from "./index.htmlx";
import style                     from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-app": App;
    }
}

@element("smd-app", { style, template })
export default class App extends HTMLXElement
{ }