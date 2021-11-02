import type NodeFactory from "./types/node-factory.js";

export default class CompilerAot
{
    public static compile(_name: string, template: string | NodeFactory): NodeFactory
    {
        if (typeof template == "string")
        {
            throw new Error("String templates not supported when using AOT.");
        }

        return template;
    }
}