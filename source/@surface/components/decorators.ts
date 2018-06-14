import { attribute, element as __element__ } from "@surface/custom-element/decorators";
import defaultStyle                          from "./index.scss";

export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): ClassDecorator
{
    if (style)
    {
        style = `${style}\n\n${defaultStyle}`;
    }
    else
    {
        style = defaultStyle;
    }

    return __element__(name, template, style, options);
}

export { attribute };