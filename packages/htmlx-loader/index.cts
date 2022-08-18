import type webpack     from "webpack";
import type { Handler } from "./internal/types/index.cjs";

async function apply(this: webpack.LoaderContext<{ handlers?: Handler[] }>, content: string): Promise<string>
{
    const module = await import("./index.js");

    return module.default.call(this, content);
}

module.exports = apply;
