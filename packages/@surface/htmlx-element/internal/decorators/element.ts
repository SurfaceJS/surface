import type { Constructor }               from "@surface/core";
import { Compiler }                       from "@surface/htmlx";
import type IHTMLXElement                 from "../interfaces/htmlx-element.js";
import type HTMLXElementDefinitionOptions from "../types/htmlx-element-definition-options.js";
import elementAot                         from "./element.aot.js";

/**
 * Defines a new custom element.
 * @param tagname tag name to be registered.
 * @param options definition options.
 */
export default function element(tagname: `${string}-${string}`, options?: HTMLXElementDefinitionOptions): <T extends Constructor<IHTMLXElement>>(target: T) => T
{
    return <T extends Constructor<IHTMLXElement>>(target: T) =>
    {
        const $options = options;

        if (typeof $options?.template == "string")
        {
            $options.template = Compiler.compile(tagname, $options.template);
        }

        return elementAot(tagname, $options)(target);
    };
}
