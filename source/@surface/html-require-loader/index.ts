import { Nullable, ObjectLiteral } from "@surface/types";

export = function (this: ObjectLiteral, content: string): string
{
    this.cacheable && this.cacheable();

    let expression = /<require\s+path\s*=\s*(\\?[""])((?:(?!\1).|\\\1)+?)\1\s*\/>(?:\s|\\[rn])*/g;

    let match:    Nullable<RegExpExecArray>;
    let requires: Array<string> = [];

    let cleanContent = content;

    while (match = expression.exec(content))
    {
        const groups =
        {
            full: 0,
            path: 2
        };

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