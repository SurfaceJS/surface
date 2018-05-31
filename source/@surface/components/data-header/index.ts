import { camelToText } from "@surface/core/common/string";
import CustomElement   from "@surface/custom-element";
import { element }     from "@surface/custom-element/decorators";
import template        from "./index.html";
import style           from "./index.scss";

@element("surface-data-header", template, style)
export default class DataHeader extends CustomElement
{
    public get field(): string
    {
        return super.getAttribute("field") || "" as string;
    }

    public set field(value: string)
    {
        super.setAttribute("field", value.toString());
    }

    public get label(): string
    {
        return super.getAttribute("label") || "" as string;
    }

    public set label(value: string)
    {
        super.setAttribute("label", value.toString());
    }

    public connectedCallback(): void
    {
        if (!this.label)
        {
            this.label = camelToText(this.field);
        }
    }
}