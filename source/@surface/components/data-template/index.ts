import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import template      from "./index.html";
import style         from "./index.scss";

const defaultTemplate = document.createElement("template");
defaultTemplate.innerHTML = "{{this.parentElement.value}}";

@element("surface-data-template", template, style)
export default class DataTemplate extends CustomElement
{
    public get field(): string
    {
        return super.getAttribute("field") || "" as string;
    }

    public set field(value: string)
    {
        super.setAttribute("field", value.toString());
    }

    public get filterable(): boolean
    {
        return super.getAttribute("filterable") == "true";
    }

    public set filterable(value: boolean)
    {
        super.setAttribute("filterable", value.toString());
    }

    public get header(): string
    {
        return super.getAttribute("header") || "" as string;
    }

    public set header(value: string)
    {
        super.setAttribute("header", value.toString());
    }

    public get sortable(): boolean
    {
        return super.getAttribute("sortable") == "true";
    }

    public set sortable(value: boolean)
    {
        super.setAttribute("sortable", value.toString());
    }

    public get template(): HTMLTemplateElement
    {
        return super.query("template") || defaultTemplate;
    }
}