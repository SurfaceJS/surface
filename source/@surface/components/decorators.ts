import { Constructor }                       from "@surface/core";
import { attribute, element as __element__ } from "@surface/custom-element/decorators";
import defaultStyle                          from "./index.scss";

export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return __element__(name, template, `${defaultStyle}\n\n${style || ""}`, options);
}

export { attribute };