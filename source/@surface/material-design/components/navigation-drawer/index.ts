import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("smd-navigation-drawer", template, style)
export default class NavigationDrawer extends CustomElement
{ }

declare global
{
    // tslint:disable-next-line:interface-name
    interface HTMLElementTagNameMap
    {
        "smd-navigation-drawer": NavigationDrawer;
    }
}