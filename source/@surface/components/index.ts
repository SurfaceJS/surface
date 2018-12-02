import { structuralEqual }        from "@surface/core/common/object";
import { dashedToCamel, toTitle } from "@surface/core/common/string";
import CustomElement              from "@surface/custom-element";
import { AttributeParse }         from "./types";

abstract class Component extends CustomElement
{
    private storedDisplay: string|null = null;

    public get disabled(): boolean
    {
        return super.getAttribute("disabled") == "true";
    }

    public set disabled(value: boolean)
    {
        super.setAttribute("disabled", value.toString());
    }

    public get height(): number
    {
        return super.getBoundingClientRect().height;
    }

    public get horizontalAlign(): Component.HorizontalAlign
    {
        return Component.HorizontalAlign[toTitle(super.getAttribute("horizontal-align") || "") as keyof typeof Component.HorizontalAlign] || Component.HorizontalAlign.Left;
    }

    public set horizontalAlign(value: Component.HorizontalAlign)
    {
        super.setAttribute("horizontal-align", value);
    }

    public get left(): number
    {
        switch (super.style.position)
        {
            case "absolute":
                return super.offsetLeft;
            case "fixed":
                return super.getBoundingClientRect().left;
            default:
                return super.parentElement ?
                    super.getBoundingClientRect().left - super.parentElement.getBoundingClientRect().left
                    : super.getBoundingClientRect().left;
        }
    }

    public set left(value: number)
    {
        if (!super.style.position)
        {
            super.style.position = "relative";
        }

        super.style.left = `${value}px`;
    }

    public get top(): number
    {
        switch (super.style.position)
        {
            case "absolute":
                return super.offsetTop;
            case "fixed":
                return super.getBoundingClientRect().top;
            default:
                return super.parentElement ?
                    super.getBoundingClientRect().top - super.parentElement.getBoundingClientRect().top
                    : super.getBoundingClientRect().top;
        }
    }

    public set top(value: number)
    {
        if (!super.style.position)
        {
            super.style.position = "relative";
        }

        super.style.top = `${value}px`;
    }

    public get verticalAlign(): Component.VerticalAlign
    {
        return Component.VerticalAlign[toTitle(super.getAttribute("vertical-align") || "") as keyof typeof Component.VerticalAlign] || Component.VerticalAlign.Top;
    }

    public set verticalAlign(value: Component.VerticalAlign)
    {
        super.setAttribute("vertical-align", value);
    }

    public get visible(): boolean
    {
        return super.style.display != "none";
    }

    public set visible(value: boolean)
    {
        if (!value && super.style.display != "none")
        {
            this.storedDisplay = super.style.display;
            super.style.display = "none";
        }
        else if (value && super.style.display == "none")
        {
            super.style.display = this.storedDisplay;
        }
    }

    public get width(): number
    {
        return super.getBoundingClientRect().width;
    }

    public static setPropertyAttribute
    <
        TTarget         extends Object,
        TAttribute      extends string,
        TPropertyMap    extends Record<TAttribute, keyof TTarget>,
        TAttributeParse extends AttributeParse<TTarget, TPropertyMap>,
    >
    (target: TTarget, parser: TAttributeParse, attribute: TAttribute, raw: string): void
    {
        const key   = dashedToCamel(attribute) as keyof TTarget;
        const value = parser[attribute](raw);

        if (!structuralEqual(value, target[key]))
        {
            target[key] = value;
        }
    }

    public setPropertyAttribute
    <
        TAttribute   extends string,
        TPropertyMap extends Record<TAttribute, keyof this>,
        TParser      extends AttributeParse<this, TPropertyMap>
    >
    (parser: TParser, attribute: TAttribute, raw: string): void
    {
        const key   = dashedToCamel(attribute) as keyof this;
        const value = parser[attribute](raw);

        if (!structuralEqual(value, this[key]))
        {
            this[key] = value;
        }
    }
}

namespace Component
{
    export enum HorizontalAlign
    {
        Center = "center",
        Left   = "left",
        Right  = "right"
    }

    export enum VerticalAlign
    {
        Bottom = "bottom",
        Center = "center",
        Top    = "top",
    }
}

export default Component;