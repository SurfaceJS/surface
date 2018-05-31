import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-cell", template, style)
export default class DataColumn extends CustomElement
{
    public get value(): string
    {
        return super.getAttribute("value") || "" as string;
    }

    public set value(value: string)
    {
        super.setAttribute("value", value);
    }
}