/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
const REGEX_SPECIAL_CHARACTERS = new Set([".", "+", "*", "?", "^", "$", "(", ")", "[", "]", "{", "}", "|", "\\"]);
const ESCAPABLE_CHARACTERS     = new Set(["!", "+", "*", "?", "^", "@", "(", ")", "[", "]", "{", "}", "|", "\\"]);
const SEPARATORS               = new Set(["/", "\\"]);
const NUMBRACES_PATTERN        = /^(-?\d+)\.\.(-?\d+)(?:\.\.(-?\d+))?$/;
const ALPHABRACES_PATTERN      = /^([a-zA-Z])\.\.([a-zA-Z])(?:\.\.(-?\d+))?$/;
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

export default class PatternMatcher
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

        /* c8 ignore start */
        if (this.index > this.source.length)
        {
            throw new Error();
        }

        /* c8 ignore stop */
    }

    private eof(): boolean
    {
        return this.index == this.source.length;
    }

    private getChar(offset?: number): string | undefined
    {
        return offset ? this.source.substring(this.index, this.index + offset) : this.source[this.index];
    }

    private lookahed(character: string, stopCondition: (index: number) => boolean = () => true): number | null
    {
        let index = this.index;

        let end: number | null = null;

        while (index < this.source.length)
        {
            const char = this.source[index];
            const next = this.source[index + 1];

            if (char == "\\" && next == character)
            {
                index += 2;
            }
            else
            {
                if (this.source[index] == character)
                {
                    if (stopCondition(index))
                    {
                        return index;
                    }

                    end = index;
                }

                index++;
            }
        }

        return end;
    }

    private parse(): RegExp
    {
        let negate = false;

        if (this.source.startsWith("!") && (this.source[1] != "(" || !this.lookahed(")", () => false)))
        {
            negate = true;

            this.advance();
        }

        while (!this.eof())
        {
            this.scanPattern();
        }

        const expression = `^${this.tokens.join("")}$`;

        return new RegExp(negate ? `^(?!${expression}).*$` : expression);
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

        const end = this.lookahed("]", index => index > this.index + 1);

        if (end)
        {
            this.tokens.push("[");

            this.advance();

            if (this.getChar() == "]" && end > this.index)
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

            while (this.index < end)
            {
                const char = this.getChar();
                const next = this.source[this.index + 1];

                if (char == "\\" && ESCAPABLE_CHARACTERS.has(next!))
                {
                    this.tokens.push("\\");
                    this.tokens.push(next!);

                    this.advance(2);
                }
                else
                {
                    this.scanLiteral();
                }
            }

            this.tokens.push("]");

            this.advance();
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
                case "{":
                    this.scanBraceExpand();
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

    private parseRange(start: number, end: number, minLenght: number): string[]
    {
        const patterns: string[] = [];

        const startValue      = start.toString().replace("-", "");
        const endValue        = end.toString().replace("-", "");
        const startSign       = start < 0 ? "-" : "";
        const endSign         = end < 0 ? "-" : "";
        const endLeadingZeros = "0".repeat(Math.max(minLenght - endValue.length, 0));
        const difference      = endValue.length - startValue.length;

        for (let i = endValue.length - 1; i >= 0; i--)
        {
            if (i > 0)
            {
                const rest = endValue.length - i - 1;

                const digit = endValue[i];

                let endPattern = `${endSign}${endLeadingZeros}${endValue.substring(0, i)}`;

                if (digit == "0")
                {
                    if (i == endValue.length - 1)
                    {
                        endPattern += "0";
                    }

                    while (endValue[i - 1] == "0")
                    {
                        i--;
                    }
                }
                else
                {
                    endPattern += `[0-${Number(digit) - (rest == 0 ? 0 : 1)}]`;

                    if (rest > 0)
                    {
                        endPattern += "[0-9]";

                        if (rest > 1)
                        {
                            endPattern += `{${rest}}`;
                        }
                    }
                }

                patterns.push(endPattern, "|");
            }
            else
            {
                if (difference > 0 && (start == 0 || startValue.length > 1))
                {
                    const rest         = endValue.length - 1;
                    const digit        = Number(endValue[0]) - 1;
                    const leadingZeros = Math.max(minLenght - (endValue.length - (digit == 0 ? 1 : 0)), 0);

                    const negatetion = (endSign ? "(?!-0)" : "") + (minLenght == 1 && rest > 1 ? "(?!0\\d)" : "");

                    let endPattern = `${negatetion + endSign}${"0".repeat(leadingZeros)}`;

                    if (digit == 1)
                    {
                        endPattern += start == 0
                            ? minLenght < endValue.length
                                ? "1?"
                                : "[01]"
                            : "1";
                    }
                    else if (digit > 1)
                    {
                        endPattern += minLenght < endValue.length
                            ? `[1-${digit}]?`
                            : `[0-${digit}]`;
                    }

                    if (rest > 0)
                    {
                        endPattern += "[0-9]";

                        if (rest > 1)
                        {
                            endPattern += minLenght == 1 && start == 0 ? `{1,${rest}}` : `{${rest}}`;

                            if (minLenght > 1 && minLenght < endValue.length)
                            {
                                endPattern += `|[0-9]{${minLenght}}`;
                            }
                        }

                        const zeros = "0".repeat(minLenght - 1);

                        if (minLenght > endValue.length)
                        {
                            if (digit > 1)
                            {
                                endPattern += `|${endSign}${zeros}[1-9]|${zeros}0`;
                            }
                        }
                        else if (endSign && (start == 0 || start < 0 && end > 0))
                        {
                            endPattern += `|${zeros}0`;
                        }
                    }

                    patterns.push(endPattern);

                    if (start != 0)
                    {
                        patterns.push("|");
                    }
                }

                if (start != 0)
                {
                    const startLeading = "0".repeat(Math.max(minLenght - startValue.length, 0));

                    if (difference > 1)
                    {
                        const leadingZeros = endLeadingZeros + (minLenght == 1 ? "" : "0");

                        if (difference > 2)
                        {
                            patterns.push(`${startSign}${leadingZeros}[1-9][0-9]{${startValue.length},${endValue.length - 2}}`);
                            patterns.push("|");
                        }
                        else if (endValue.length > 2)
                        {
                            patterns.push(`${startSign}${leadingZeros}[1-9][0-9]{${endValue.length - 2}}`);
                            patterns.push("|");
                        }
                    }

                    for (let j = startValue.length - 1; j >= 0; j--)
                    {
                        if (j > 0 || startValue.length < endValue.length)
                        {
                            const digit = startValue[j];
                            const rest  = startValue.length - j - 1;

                            let startPattern = `${startSign}${startLeading}${startValue.substring(0, j)}`;

                            startPattern += digit == "9" ? digit : `[${Number(digit) + (rest == 0 ? 0 : 1)}-9]`;

                            if (rest > 0)
                            {
                                startPattern += "[0-9]";

                                if (rest > 1)
                                {
                                    startPattern += `{${rest}}`;
                                }
                            }

                            patterns.push(startPattern);

                            if (j > 1 || j > 0 && startValue.length < endValue.length)
                            {
                                patterns.push("|");
                            }
                        }
                    }
                }
            }
        }

        return patterns;
    }

    private scanBraceExpand(): void
    {
        const end = this.lookahed("}");

        if (end)
        {
            this.tokens.push(GROUPS["@"].open);
            this.advance();

            let isOptional = false;

            while (this.index < end)
            {
                const segmentEnd = Math.min(this.lookahed(",") ?? end, end);

                const segment = this.source.substring(this.index, segmentEnd);

                if (segment)
                {
                    const alphaMatch = ALPHABRACES_PATTERN.exec(segment);
                    const digitMatch = NUMBRACES_PATTERN.exec(segment);

                    if (alphaMatch)
                    {
                        this.scanAlphaRange(alphaMatch[1]!, alphaMatch[2]!, Number(alphaMatch[3] ?? "1"));
                    }
                    else if (digitMatch)
                    {
                        this.scanNumericRange(digitMatch[1]!, digitMatch[2]!, Number(digitMatch[3] ?? "1"));
                    }
                    else
                    {
                        while (this.index < segmentEnd)
                        {
                            this.scanLiteral();
                        }
                    }

                    if (alphaMatch || digitMatch)
                    {
                        this.advance(segmentEnd - this.index);
                    }

                    if (this.getChar() == ",")
                    {
                        this.tokens.push("|");

                        this.advance();
                    }
                }
                else
                {
                    isOptional = true;
                    this.advance();
                }
            }

            this.tokens.push(GROUPS["@"].close);

            if (isOptional)
            {
                this.tokens.push("?");
            }

            this.advance();
        }
        else
        {
            this.scanLiteral();
        }
    }

    private scanAlphaRange(startChar: string, endChar: string, multiplier: number): void
    {
        const startRange = startChar.charCodeAt(0);
        const endRange   = endChar.charCodeAt(0);

        if (multiplier != 0)
        {
            this.tokens.push("[");

            const isValidRange = startRange < endRange
                && (
                    startChar == startChar.toLowerCase() && endChar == endChar.toLowerCase()
                    || startChar == startChar.toUpperCase() && endChar == endChar.toUpperCase()
                );

            if (multiplier == 1 && isValidRange)
            {
                this.tokens.push(String.fromCharCode(startRange), "-", String.fromCharCode(endRange));
            }

            else
            {
                for (let i = startRange; i <= endRange; i += multiplier)
                {
                    const char = String.fromCharCode(i);

                    if (char != "\\")
                    {
                        if (char == "]" || char == "^")
                        {
                            this.tokens.push("\\");
                        }

                        this.tokens.push(char);
                    }
                }
            }

            this.tokens.push("]");
        }
    }

    private scanNumericRange(startRange: string, endRange: string, multiplier: number): void
    {
        const getMinLength = (value: string): number =>
        {
            const padded = value.replace("-", "");

            return padded.startsWith("0") ? padded.length : 1;
        };

        const minLenght = Math.max(getMinLength(startRange), getMinLength(endRange));

        const parsedStartRange = Number(startRange);
        const parsedEndRange   = Number(endRange);

        const start = Math.min(parsedStartRange, parsedEndRange);
        const end   = Math.max(parsedStartRange, parsedEndRange);

        const inSimpleRange = (value: number): boolean => value >= 0 && value <= 9;

        if (multiplier == 1)
        {
            if (inSimpleRange(start) && inSimpleRange(end))
            {
                if (minLenght > 1)
                {
                    this.tokens.push("0".repeat(minLenght - 1));
                }

                this.tokens.push("[");
                this.tokens.push(start.toString(), "-", end.toString());
                this.tokens.push("]");
            }
            else if (start >= 0 && end > 0)
            {
                this.tokens.push(...this.parseRange(start, end, minLenght));
            }
            else if (start < 0 && end <= 0)
            {
                this.tokens.push(...this.parseRange(end, start, minLenght));
            }
            else if (end >= 0)
            {
                this.tokens.push(...this.parseRange(0, start, minLenght));
                this.tokens.push("|");
                this.tokens.push(...this.parseRange(0, end, minLenght));
            }
        }
        else if (inSimpleRange(start) && inSimpleRange(end))
        {
            this.tokens.push("[");

            for (let i = start; i <= end; i += multiplier)
            {
                this.tokens.push(i.toString());

                if (i + multiplier < end)
                {
                    this.tokens.push();
                }
            }

            this.tokens.push("]");
        }
        else
        {
            for (let i = start; i <= end; i += multiplier)
            {
                this.tokens.push(i.toString().padStart(minLenght, "0"));

                if (i + multiplier <= end)
                {
                    this.tokens.push("|");
                }
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
        const end = this.lookahed(")", index => !!this.patternList?.end && index < this.patternList.end);

        if (end)
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
