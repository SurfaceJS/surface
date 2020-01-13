import { element } from "@surface/custom-element/decorators";
import Component   from "..";
import template    from "./index.html";
import style       from "./index.scss";

type KeyValue = { key: string, value: string };

@element("surface-dropdown", template, style)
export default class DropDown extends Component
{
    private readonly select: HTMLSelectElement = super.references.select as HTMLSelectElement;

    private _source: Iterable<KeyValue> = [];
    private _value:  string             = "";

    public get selectedIndex(): number
    {
        return this.select.options.selectedIndex;
    }

    public set selectedIndex(value: number)
    {
        this.select.options.selectedIndex = value;
    }

    public get source(): Iterable<KeyValue>
    {
        return this._source;
    }

    public set source(value: Iterable<KeyValue>)
    {
        if (value != this._source)
        {
            this.innerHTML = "";

            for (const element of value)
            {
                const option     = document.createElement("option");
                option.value     = element.key;
                option.innerHTML = element.value;

                this.select.appendChild(option);
            }
        }
    }

    public get value(): string
    {
        return this._value || this.select.value;
    }

    public set value(value: string)
    {
        this._value = value;
    }

    protected changed(): void
    {
        this.value = this.select.value;
    }
}