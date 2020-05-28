import { typeGuard }          from "@surface/core";
import Component              from "..";
import { attribute, element } from "../decorators";
import style                  from "./index.scss";

@element("surface-switch", "", style)
export default class Switch extends Component
{
    private readonly templates: Map<string, HTMLTemplateElement> = new Map();

    private _value: string = "";

    @attribute
    public get value(): string
    {
        return this._value;
    }

    public set value(value: string)
    {
        if (value != this.value)
        {
            this._value = value;
            this.changed();
        }
    }

    public constructor()
    {
        super();
        const templates = this.querySelectorAll<HTMLTemplateElement>("template");
        templates.forEach(x => { this.templates.set(x.getAttribute("when") || "default", x); this.removeChild(x); });
    }

    private changed(): void
    {
        const template = this.templates.get(this.value);

        // CustomElement.clearDirectives(this.childNodes);

        this.innerHTML = "";

        if (template)
        {
            const content = document.importNode(template.content, true);

            content.normalize();

            // CustomElement.processDirectives(this, content, this.context);

            this.appendChild(content);
        }

        this.dispatchEvent(new Event("change"));
    }

    public appendChild<T extends Node>(element: T): T
    {
        if (typeGuard<HTMLTemplateElement>(element, element.nodeName == "template"))
        {
            this.templates.set(element.getAttribute("when") || "default", element);
        }

        return element;
    }

    public setCondition(value: string, template: HTMLTemplateElement): void
    {
        template.setAttribute("when", value);
        this.templates.set(value, template);
    }
}