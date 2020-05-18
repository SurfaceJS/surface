import { dashedToTitle } from "@surface/core";
import CustomElement     from "@surface/custom-element";
import Enumerable        from "@surface/enumerable";
import { element }       from "../decorators";
import template          from "./index.html";
import style             from "./index.scss";
import MenuItem          from "./menu-item";

@element("surface-menu", template, style)
export class Menu extends CustomElement
{
    public get items(): Enumerable<MenuItem>
    {
        return Enumerable.from(Array.from(super.querySelectorAll<MenuItem>("surface-menu-item"))).where(x => x.parentElement == this);
    }

    public get type(): Menu.Type
    {
        return Menu.Type[dashedToTitle(super.getAttribute("type") || "") as keyof typeof Menu.Type] || Menu.Type.Static;
    }

    public set type(value: Menu.Type)
    {
        super.setAttribute("type", Menu.Type[value].toLowerCase());
    }
}

export namespace Menu
{
    export enum Type
    {
        Static,
        Context
    }
}

export default Menu;