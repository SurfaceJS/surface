import { capture } from "@surface/core/common/string";
import webpack     from "webpack";

const expression = /^\s*(?:(?:\\\\)?#import\s+(\\?["'])([^"']+)\1)/;

export default function (this: webpack.loader.LoaderContext, source: string): string
{
    this.cacheable();

    const [start, middle, end] = capture(source, /((module.exports =)|(export default)) "/, /(")(?!(.|\n)*\1)/);

    if (!middle)
    {
        return source;
    }

    const esmodule = start.startsWith("export default");
    const imports  = [] as Array<string>;

    let content = middle;

    let match: RegExpExecArray | null;

    while (match = expression.exec(content))
    {
        const [full, , path] = match;

        const importExpression = esmodule ? `import "${path}";` : `require("${path}");`;

        const scaped = full.startsWith("\\\\");

        if (!scaped && !imports.includes(importExpression))
        {
            imports.push(importExpression);
        }

        content = ((scaped ? full.replace(/^\\\\/, "") : "") + content.substring(match.index + full.length, content.length))
            .replace(/^\n*/, "");

        if (scaped)
        {
            break;
        }

        expression.lastIndex = 0;
    }

    const parsed = [...imports, (start + content.trim() + end)].join("\n");

    return parsed;
}