export default function parsePatternPath(pattern: string): RegExp
{
    let expression = "";

    for (let index = 0, len = pattern.length; index < len; index++)
    {
        const character = pattern[index];

        switch (character)
        {
            case "/":
            case "\\":
                expression += "(\\/|\\\\)";
                break;
            case ".":
                expression += `\\${character}`;
                break;
            case "*":
                {
                    const previous = pattern[index - 1];

                    let starCount = 1;

                    while (pattern[index + 1] == "*")
                    {
                        starCount++;
                        index++;
                    }

                    const next = pattern[index + 1];

                    const isGlobstar = starCount > 1
                        && (previous == "/" || previous == "\\" || !previous)
                        && (next == "/" || next == "\\" || !next);

                    if (isGlobstar)
                    {
                        expression += "(.*)(\\/|\\\\)?";
                        index++;
                    }

                    else
                    {
                        expression += "([^\\/\\\\]*)";
                    }
                }
                break;
            default:
                expression += character;
        }
    }

    expression = `^${expression}$`;

    return new RegExp(expression);
}
