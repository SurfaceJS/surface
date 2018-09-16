import { Nullable } from "@surface/core";

// tslint:disable-next-line:no-any
export default function (this: any, content: string): string
{
    // tslint:disable-next-line:no-unused-expression
    this.cacheable && this.cacheable();

    const expression = /(<!--(?:(?!<!--).)*?-->)|(?:<surface-(import|require)\s+from\s*=\s*(\\?["'])((?:(?!\3).|\\\3)+?)\3\s*\/>((?:\s|\\[rn])*))/g;
    const requires   = [] as Array<string>;
    let   esmodule   = false;

    let raw = content;

    let match: Nullable<RegExpExecArray>;

    while (match = expression.exec(content))
    {
        const [full, comments, method, , from] = match;

        if (comments)
        {
            continue;
        }

        esmodule = esmodule || method == "import";

        const requireExpression = esmodule ? `import "${from}";` : `require("${from}");`;

        if (!requires.includes(requireExpression))
        {
            requires.push(requireExpression);
        }

        raw = raw.replace(full, "");
    }

    const stringModule = requires.concat(["", esmodule ? raw.replace("module.exports =", "export default") : raw]).join("\n");

    return stringModule;
}