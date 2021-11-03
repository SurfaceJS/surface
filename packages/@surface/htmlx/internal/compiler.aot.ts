import type TemplateFactory from "./types/template-factory.js";

export default class CompilerAot
{
    public static compile(_name: string, template: string | TemplateFactory): TemplateFactory
    {
        if (typeof template == "string")
        {
            throw new Error("String templates not supported when using AOT.");
        }

        return template;
    }
}