// eslint-disable-next-line import/no-unassigned-import
import "./root.scss?global";

import CustomElement, { element } from "@surface/custom-element";
import template                   from "./index.htmx";
import style                      from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-app": App;
    }
}

@element("smd-app", { style, template })
export default class App extends CustomElement
{ }