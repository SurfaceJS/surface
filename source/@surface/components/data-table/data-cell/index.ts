import { Unknown }   from "@surface/core";
import { coalesce }  from "@surface/core/common/generic";
import CustomElement from "@surface/custom-element";
import { element }   from "../../decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-cell", template, style)
export default class DataCell extends CustomElement
{
    private _editable: boolean;
    public get editable(): boolean
    {
        return this._editable;
    }
    public set editable(value: boolean)
    {
        this._editable = value;
    }

    private _index: number;
    public get index(): number
    {
        return this._index;
    }

    public set index(value: number)
    {
        this._index = value;
    }

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

    public constructor(editable?: boolean, index?: number, text?: string, value?: Unknown)
    {
        super();
        this._editable = coalesce<boolean>(editable, false);
        this._index    = coalesce<number>(index, 0);
        this._value    = value;

        if (text)
        {
            this.text = text;
        }
    }

    public setContent(content: HTMLElement)
    {
        super.shadowRoot!.appendChild(content);
    }
}