import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import Enumerable    from "@surface/enumerable";
import MenuItem      from "../menu-item";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-menu", template, style)
export class Menu extends CustomElement
{
    public get items(): Enumerable<MenuItem>
    {
        return super.findAll<MenuItem>("surface-menu-item").where(x => x.parentElement == this);
    }
}