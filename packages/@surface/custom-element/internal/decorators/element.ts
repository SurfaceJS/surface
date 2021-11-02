import type { Constructor }                from "@surface/core";
import TemplateCompiler                    from "@surface/htmlx";
import type ICustomElement                 from "../interfaces/custom-element.js";
import type CustomElementDefinitionOptions from "../types/custom-element-definition-options.js";
import elementAot                          from "./element.aot.js";

/**
 * Defines a new custom element.
 * @param tagname tag name to be registered.
 * @param options definition options.
 */
export default function element(tagname: `${string}-${string}`, options?: CustomElementDefinitionOptions): <T extends Constructor<ICustomElement>>(target: T) => T
{
    return <T extends Constructor<ICustomElement>>(target: T) =>
    {
        const $options = options;

        if (typeof $options?.template == "string")
        {
            $options.template = TemplateCompiler.compile(tagname, $options.template);
        }

        return elementAot(tagname, $options)(target);
    };
}
