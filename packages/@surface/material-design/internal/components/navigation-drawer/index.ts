import CustomElement, { element } from "@surface/custom-element";
import template                   from "./index.htmx";
import style                      from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-navigation-drawer": NavigationDrawer;
    }
}

@element("smd-navigation-drawer", { style, template })
export default class NavigationDrawer extends CustomElement
{ }