/* eslint-disable @typescript-eslint/indent */
import path                              from "path";
import type webpack                      from "webpack";
import { mapHandlers }                   from "./internal/attribute-handlers.js";
import SourceGenerator                   from "./internal/source-generator.js";
import type { ElementAttributeHandlers } from "./internal/types";

export type
{
    AttributeHandlers,
    AttributeHandler,
    AttributeFilter,
    AttributeResolver,
    ElementAttributeHandlers,
}
from "./internal/types";

export default async function loader(this: webpack.LoaderContext<{ handlers?: ElementAttributeHandlers[] }>, content: string): Promise<string>
{
    const file = path.relative(this.rootContext, this.resourcePath);

    const handlers = mapHandlers(this.getOptions().handlers ?? []);

    return Promise.resolve(SourceGenerator.generate(file, content, handlers, this.mode != "production"));
}