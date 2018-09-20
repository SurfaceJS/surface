import { Nullable }            from "@surface/core";
import { coalesce, typeGuard } from "@surface/core/common/generic";
import CustomElement           from "@surface/custom-element";
import Component               from "..";
import { attribute, element }  from "../decorators";
import style                   from "./index.scss";

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
        const templates = super.queryAll<HTMLTemplateElement>("template");
        templates.forEach(x => { this.templates.set(x.getAttribute("when") || "default", x); super.removeChild(x); });
    }

    private changed(): void
    {
        const template = this.templates.get(this.value) || this.templates.get("default");

        if (template)
        {
            CustomElement.contextUnbind(this);

            super.innerHTML = "";
            super.appendChild(document.importNode(template.content, true));

            CustomElement.contextBind(super.context, this);
        }
    }

    protected attributeChangedCallback(name: "value", _: Nullable<string>, newValue: Nullable<string>)
    {
        if (newValue != this[name])
        {
            this[name] = coalesce(newValue, "");
        }
    }

    public appendChild<T extends Node>(element: T): T
    {
        if (typeGuard<Node, HTMLTemplateElement>(element, x => x.nodeName == "template"))
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