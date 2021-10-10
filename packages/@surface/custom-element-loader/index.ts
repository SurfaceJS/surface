import path            from "path";
import type webpack    from "webpack";
import SourceGenerator from "./internal/source-generator.js";

export default async function loader(this: webpack.LoaderContext<undefined>, content: string): Promise<string>
{
    const file = path.relative(this.rootContext, this.resourcePath);

    return Promise.resolve(SourceGenerator.generate(file, content, this.mode == "production"));
}