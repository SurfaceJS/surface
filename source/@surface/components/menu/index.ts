import { dashedToTitle } from "@surface/core/common/string";
import CustomElement     from "@surface/custom-element";
import { element }       from "@surface/custom-element/decorators";
import Enumerable        from "@surface/enumerable";
import MenuItem          from "../menu-item";
import template          from "./index.html";
import style             from "./index.scss";

@element("surface-menu", template, style)
export class Menu extends CustomElement
{
    public get items(): Enumerable<MenuItem>
    {
        return super.queryAll<MenuItem>("surface-menu-item").where(x => x.parentElement == this);
    }

    public get type(): Menu.Type
    {
        return Menu.Type[dashedToTitle(super.getAttribute("type") || "")] || Menu.Type.Static;
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