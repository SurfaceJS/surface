const isSeparator = (value: string | undefined): boolean => value == "/" || value == "\\";

// TODO: implement Bash 4.3 specification(https://www.gnu.org/software/bash/manual/bash.html#Filename-Expansion)
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
                expression += "(?:\\/|\\\\)";
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

                    const isGlobStar = starCount > 1
                        && (!previous || isSeparator(previous))
                        && (!next || isSeparator(next));

                    if (isGlobStar)
                    {
                        index++;

                        if (isSeparator(previous) && index == pattern.length)
                        {
                            expression += "?.*";
                        }
                        else
                        {
                            expression += ".*(?:\\/|\\\\)?";
                        }

                    }

                    else
                    {
                        expression += "[^\\/\\\\]*";
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
