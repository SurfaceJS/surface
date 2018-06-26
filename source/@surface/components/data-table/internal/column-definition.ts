import { Nullable } from "@surface/core";

export default class ColumnDefinition
{
    private readonly element: Element;

    public get editable(): boolean
    {
        return this.element.getAttribute("editable") == "true";
    }

    public set editable(value: boolean)
    {
        this.element.setAttribute("editable", value.toString());
    }

    public get editButtom(): boolean
    {
        return this.element.getAttribute("edit-buttom") == "true";
    }

    public set editButtom(value: boolean)
    {
        this.element.setAttribute("edit-buttom", value.toString());
    }

    public get deleteButtom(): boolean
    {
        return this.element.getAttribute("delete-buttom") == "true";
    }

    public set deleteButtom(value: boolean)
    {
        this.element.setAttribute("delete-buttom", value.toString());
    }

    public get field(): string
    {
        return this.element.getAttribute("field") || "" as string;
    }

    public set field(value: string)
    {
        this.element.setAttribute("field", value);
    }

    public get filterable(): boolean
    {
        return this.element.getAttribute("filterable") == "true";
    }

    public set filterable(value: boolean)
    {
        this.element.setAttribute("filterable", value.toString());
    }

    public get footer(): string
    {
        return this.element.getAttribute("footer") || "" as string;
    }

    public set footer(value: string)
    {
        this.element.setAttribute("footer", value);
    }

    public get header(): string
    {
        return this.element.getAttribute("header") || "" as string;
    }

    public set header(value: string)
    {
        this.element.setAttribute("header", value);
    }

    public get style(): string
    {
        return this.element.getAttribute("style") || "" as string;
    }

    public set style(value: string)
    {
        this.element.setAttribute("style", value);
    }

    private readonly _template: Nullable<HTMLTemplateElement>;
    public get template(): Nullable<HTMLTemplateElement>
    {
        if (this.element.children.length > 0)
        {
            const template = document.createElement("template");
            template.innerHTML = this.element.innerHTML;
        }

        return this._template;
    }

    public constructor(element: Element)
    {
        this.element = element;
    }
}