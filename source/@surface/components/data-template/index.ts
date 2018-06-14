import CustomElement from "@surface/custom-element";
import { element }   from "../decorators";

@element("surface-data-template")
export default class DataTemplate extends CustomElement
{
    public get field(): string
    {
        return super.getAttribute("field") || "" as string;
    }

    public set field(value: string)
    {
        super.setAttribute("field", value);
    }

    public get header(): string
    {
        return super.getAttribute("header") || "" as string;
    }

    public set header(value: string)
    {
        super.setAttribute("header", value);
    }
}