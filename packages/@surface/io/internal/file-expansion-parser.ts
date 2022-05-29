const REGEX_SPECIAL_CHARACTERS = new Set([".", "+", "*", "?", "^", "$", "(", ")", "[", "]", "{", "}", "|", "\\"]);
const ESCAPABLE_CHARACTERS     = new Set(["!", "+", "*", "?", "^", "@", "(", ")", "[", "]", "{", "}", "|", "\\"]);
const SEPARATORS               = new Set(["/", "\\"]);
const CHARACTERS_CLASS_MAP: Record<string, string> =
{
    "[:alnum:]":  "[A-Za-z0-9]",
    "[:alpha:]":  "[A-Za-z]",
    "[:ascii:]":  "[\\x00-\\x7F]",
    "[:blank:]":  "[ \\t]",
    "[:cntrl:]":  "[\\x00-\\x1F\\x7F]",
    "[:digit:]":  "\\d",
    "[:graph:]":  "[\\x21-\\x7E]",
    "[:lower:]":  "[a-z]",
    "[:print:]":  "[\\x20-\\x7E]",
    "[:punct:]":  "[^ A-Za-z0-9]",
    "[:space:]":  "\\s",
    "[:upper:]":  "[A-Z]",
    "[:word:]":   "\\w",
    "[:xdigit:]": "[0-9a-fA-F]",
};

const GROUPS =
{
    "!": { open: "(?:(?!", close: ").*)" },
    "*": { open: "(?:",    close: ")*" },
    "+": { open: "(?:",    close: ")+" },
    "?": { open: "(?:",    close: ")?" },
    "@": { open: "(?:",    close: ")" },
};

type PatternList =
{
    start:   number,
    end:     number,
    parent?: PatternList,
};

// improving this regexp to avoid a ReDOS vulnerability.
// /\{(?:(?!\{).)*\}/.test(pattern)

export default class FileExpansionParser
{
    private readonly tokens: string[] = [];

    private index: number = 0;
    private patternList?: PatternList;

    public constructor(private readonly source: string)
    { }

    public static parse(pattern: string): RegExp
    {
        return new this(pattern).parse();
    }

    private advance(offset: number = 1): void
    {
        this.index += offset;

        if (this.index > this.source.length)
        {
            throw new Error();
        }
    }

    private eof(): boolean
    {
        return this.index == this.source.length;
    }

    private getChar(offset?: number): string | undefined
    {
        return offset ? this.source.substring(this.index, this.index + offset) : this.source[this.index];
    }

    private parse(): RegExp
    {
        while (!this.eof())
        {
            this.scanPattern();
        }

        return new RegExp(`^${this.tokens.join("")}$`);
    }

    private scanClasses(): void
    {
        if (this.getChar(2) == "[:")
        {
            for (const offset of [8, 9, 10])
            {
                const characterClass = CHARACTERS_CLASS_MAP[this.getChar(offset)!];

                if (characterClass)
                {
                    this.advance(offset);

                    this.tokens.push(characterClass);

                    return;
                }
            }
        }

        let closed            = false;
        let hasImplicitEscape = false;

        let index = this.index + 1;

        while (!closed && index < this.source.length)
        {
            const char = this.source[index];
            const next = this.source[index + 1];

            if (char == "\\" && next == "]")
            {
                index += 2;
            }
            else
            {
                if (this.source[index] == "]")
                {
                    if (index == this.index + 1)
                    {
                        hasImplicitEscape = true;
                    }
                    else
                    {
                        closed = true;
                    }
                }

                index++;
            }

        }

        if (!closed && this.source[this.index + 1] == "]")
        {
            closed            = true;
            hasImplicitEscape = false;
        }

        if (closed)
        {
            this.tokens.push("[");

            this.advance();

            if (hasImplicitEscape)
            {
                this.tokens.push("\\]");
                this.advance();
            }

            const char = this.getChar();

            if (char == "!" || char == "^")
            {
                this.tokens.push("^");
                this.advance();
            }

            while (!this.eof())
            {
                const char = this.getChar();
                const next = this.source[this.index + 1];

                if (char == "\\" && ESCAPABLE_CHARACTERS.has(next!))
                {
                    this.tokens.push("\\");
                    this.tokens.push(next!);

                    this.advance(2);
                }
                else if (char == "]")
                {
                    break;
                }
                else
                {
                    this.scanLiteral();
                }
            }

            if (!this.eof())
            {
                this.tokens.push("]");

                this.advance();
            }
        }
        else
        {
            this.scanLiteral();
        }
    }

    private scanPattern(): void
    {
        while (!this.eof())
        {
            const char = this.getChar()!;

            if (char == ")" && this.patternList?.end == this.index)
            {
                return;
            }

            switch (char)
            {
                case "\\":
                case "/":
                    {
                        const next = this.source[this.index + 1];

                        if (char == "\\" && ESCAPABLE_CHARACTERS.has(next!))
                        {
                            this.tokens.push("\\");
                            this.tokens.push(next!);

                            this.advance(2);
                        }
                        else
                        {
                            this.tokens.push("(?:\\/|\\\\)");
                            this.advance();
                        }
                    }

                    break;
                case "!":
                case "*":
                case "+":
                case "?":
                case "@":
                    if (this.source[this.index + 1] == "(")
                    {
                        this.scanPatternList();
                    }
                    else if (char == "?")
                    {
                        this.scanPlaceholder();
                    }
                    else if (char == "*")
                    {
                        this.scanStar();
                    }
                    else
                    {
                        this.scanLiteral();
                    }

                    break;
                case "[":
                    this.scanClasses();
                    break;
                default:
                    if (this.patternList && char == "|")
                    {
                        if (char == "|")
                        {
                            this.tokens.push("|");
                            this.advance();
                        }
                    }
                    else
                    {
                        this.scanLiteral();
                    }

                    break;
            }
        }
    }

    private scanLiteral(): void
    {
        const char = this.getChar()!;

        if (REGEX_SPECIAL_CHARACTERS.has(char))
        {
            this.tokens.push("\\");
        }

        this.tokens.push(char);
        this.advance();
    }

    private scanPlaceholder(): void
    {
        this.tokens.push(".");

        this.advance();
    }

    private scanPatternList(): void
    {
        let index = this.index;
        let end   = -1;

        while (index < this.source.length)
        {
            const char = this.source[index];
            const next = this.source[index + 1];

            if (char == "\\" && (next == "|" || next == ")"))
            {
                index += 2;
            }
            else
            {
                if (char == ")" && this.patternList?.end != index)
                {
                    end = index;
                }

                index++;
            }
        }

        if (end != -1)
        {
            this.patternList = { start: this.index, end, parent: this.patternList };

            const char = this.getChar() as keyof typeof GROUPS;

            this.advance(2);

            this.tokens.push(GROUPS[char].open);

            this.scanPattern();

            this.tokens.push(GROUPS[char].close);

            this.advance();

            this.patternList = this.patternList.parent;
        }
        else
        {
            this.scanLiteral();
        }
    }

    private scanStar(): void
    {
        let stars = 0;

        while (this.getChar() == "*")
        {
            this.advance();

            stars++;
        }

        if (stars == 2)
        {
            this.tokens.push(".*(?:\\/|\\\\)?");

            if (SEPARATORS.has(this.getChar()!))
            {
                this.advance();
            }
        }
        else
        {
            this.tokens.push("[^\\/\\\\]*");
        }
    }
}
