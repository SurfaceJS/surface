import { Unknown }   from "@surface/core";
import CustomElement from "@surface/custom-element";
import { element }   from "../decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-cell", template, style)
export default class DataCell extends CustomElement
{
    public get text(): string
    {
        return super.getAttribute("value") || "" as string;
    }

    public set text(value: string)
    {
        super.setAttribute("value", value || "");
    }

    private _value: Unknown;
    public get value(): Unknown
    {
        return this._value;
    }

    public set value(value: Unknown)
    {
        this._value = value;
    }

    public constructor()
    {
        super({ mode: "open" });
    }

    public setContent(content: HTMLElement)
    {
        super.shadowRoot!.appendChild(content);
    }
}