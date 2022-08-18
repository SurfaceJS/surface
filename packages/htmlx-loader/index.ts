/* eslint-disable @typescript-eslint/indent */
import path             from "path";
import type webpack     from "webpack";
import { mapHandlers }  from "./internal/attribute-handlers.js";
import SourceGenerator  from "./internal/source-generator.js";
import type { Handler } from "./internal/types/index.cjs";

export type
{
    AttributeHandlers,
    AttributeHandler,
    AttributeFilter,
    AttributeResolver,
    Handler,
}
from "./internal/types/index.cjs";

export default async function apply(this: webpack.LoaderContext<{ handlers?: Handler[] }>, content: string): Promise<string>
{
    const file = path.relative(this.rootContext, this.resourcePath);

    const handlers = mapHandlers(this.getOptions().handlers ?? []);

    return Promise.resolve(SourceGenerator.generate(file, content, handlers, this.mode != "production"));
}
