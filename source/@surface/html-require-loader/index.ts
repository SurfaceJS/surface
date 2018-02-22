import { Nullable } from "@surface/types";

// tslint:disable-next-line:no-any
export = function (this: any, content: string): string
{
    // tslint:disable-next-line:no-unused-expression
    this.cacheable && this.cacheable();

    let expression = /<!--(?:(?!<!--).)*?-->|(?:<require\s+path\s*=\s*(\\?[""])((?:(?!\1).|\\\1)+?)\1\s*\/>((?:\s|\\[rn])*))/g;

    let match:    Nullable<RegExpExecArray>;
    let requires: Array<string> = [];

    let cleanContent = content;

    const groups =
    {
        full:         0,
        path:         2,
        leadingSpace: 3
    };

    while (match = expression.exec(content))
    {
        if (!match[groups.path])
        {
            continue;
        }

        let requireExpression = `require("${match[groups.path]}");`;

        if (!requires.includes(requireExpression))
        {
            requires.push(requireExpression);
        }

        cleanContent = cleanContent.replace(match[groups.full], "");
    }

    let stringModule = requires.concat(["", cleanContent]).join("\n");

    return stringModule;
};