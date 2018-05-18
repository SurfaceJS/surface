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

    public get orientation(): Menu.Orientation
    {
        return Menu.Orientation[dashedToTitle(super.getAttribute("orientation") || "")] || Menu.Orientation.Horizontal;
    }

    public set orientation(value: Menu.Orientation)
    {
        super.setAttribute("orientation", Menu.Orientation[value].toLowerCase());
    }
}

export namespace Menu
{
    export enum Orientation
    {
        Horizontal,
        Vertical
    }
}