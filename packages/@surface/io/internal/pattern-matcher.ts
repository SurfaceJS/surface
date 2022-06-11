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

    private lookahead(character: string, stopCondition: (index: number) => boolean = () => true): number | null
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

        if (this.source.startsWith("!") && (this.source[1] != "(" || !this.lookahead(")", () => false)))
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

        const end = this.lookahead("]", index => index > this.index + 1);

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

    private createRange(min: number, max: number, quantifier: number = 1): string
    {
        const separator = max - min > 1 ? "-" : "";

        const range = min == max
            ? String(max)
            : min == 0 && max == 9
                ? "\\d"
                : `[${min}${separator}${max}]`;

        return range + (quantifier == 1 ? "" : `{${quantifier}}`);
    }

    private parseRange(start: number, end: number, minLength: number): string[]
    {
        const patterns: string[] = [];

        const startValue        = start.toString().replace("-", "");
        const endValue          = end.toString().replace("-", "");
        const leadingStartDigit = Number(startValue[0]);
        const leadingEndDigit   = Number(endValue[0]);
        const startSign         = start < 0 ? "-" : "";
        const endSign           = end < 0 ? "-" : "";
        const endLeadingZeros   = "0".repeat(Math.max(minLength - endValue.length, 0));
        const hasSameLength     = endValue.length == startValue.length;
        const endCeiling        = endValue[0] + "0".repeat(endValue.length - 1);
        const startCeiling      = start > 0 ? startValue.length == 1 ? "0" : startValue[0] + "0".repeat(startValue.length - 1) : "";
        // const hasLeadingZeros = minLength > 1 && startValue.length != endValue.length;

        for (let i = endValue.length - 1; i > 0; i--)
        {
            const rest = endValue.length - i - 1;

            const leadingEnd   = endValue.substring(0, i);
            const leadingStart = hasSameLength ? startValue.substring(0, i) : "";

            const hasSameLeading = leadingEnd == leadingStart;

            const startDigit = hasSameLeading ? Number(startValue[i]) : 0;
            const endDigit   = Number(endValue[i]);

            let endPattern = `${endSign}${endLeadingZeros}${leadingEnd}`;

            if (endDigit == 0)
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
                const startRange = startDigit;
                const endRange   = endDigit - (rest == 0 ? 0 : 1);

                if (leadingStart == leadingEnd && startRange == endRange)
                {
                    break;
                }
                else
                {
                    endPattern += this.createRange(startDigit, endDigit - (rest == 0 ? 0 : 1));
                }

                if (rest > 0)
                {
                    endPattern += "\\d";

                    if (rest > 1)
                    {
                        endPattern += `{${rest}}`;
                    }
                }
            }

            if (patterns.length > 0)
            {
                patterns.push("|");
            }

            patterns.push(endPattern);

            if (i > 1 && leadingEnd == leadingStart)
            {
                break;
            }
        }

        if (startValue == endCeiling)
        {
            return patterns;
        }

        if (start == 0)
        {
            patterns.push("|");

            if (endValue.length == 2)
            {
                const rest = endValue.length - 1;

                const digit = leadingEndDigit - 1;

                if (digit == 0)
                {
                    if (rest == 1)
                    {
                        patterns.push(`${endSign}\\d`);
                    }
                    else
                    {
                        patterns.push(`${endSign}[1-9]\\d{${rest}}`);
                    }
                }
                else if (digit == 1)
                {
                    patterns.push(`${endSign}1?\\d`);
                }
                else
                {
                    patterns.push(`${endSign}[1-${leadingEndDigit - 1}]?\\d`);
                }
            }
            else
            {
                const rest = endValue.length - 1;

                if (leadingEndDigit > 1 && rest > 1)
                {
                    patterns.push(`${endSign}[1-${leadingEndDigit - 1}]\\d{${rest}}`);

                    const quantifier = rest == 2 ? "" : `{${rest - 1}}`;

                    patterns.push("|", `${endSign}[1-9]\\d${quantifier}`);
                    patterns.push("|", "\\d");
                }
                else
                {
                    patterns.push(`${endSign}[1-9]?\\d`);
                }

            }
        }
        else if (startValue.length == endValue.length && startValue == startCeiling)
        {
            const rest       = startValue.length - 1;
            const quantifier = rest == 1 ? "" : `{${rest}}`;
            const range      = leadingEndDigit - 1 == leadingStartDigit
                ? startValue[0]
                : `[${startValue[0]}-${leadingEndDigit - 1}]`;

            patterns.push("|", `${startSign}${range}\\d${quantifier}`);
        }
        else if (startValue == startCeiling)
        {
            const rest       = endValue.length - 2;
            const quantifier = rest == 1 ? "" : `{${rest}}`;

            if (leadingEndDigit > 1)
            {
                patterns.push("|", `${endSign}[1-${leadingEndDigit - 1}]\\d{${rest + 1}}`);
            }

            patterns.push("|", `${startSign}[${startValue[0]}-9]\\d${quantifier}`);
        }
        else
        {
            if (endValue.length - startValue.length > 1 || endValue.length - startValue.length > 0 && leadingEndDigit > 1)
            {
                if (leadingEndDigit > 1)
                {
                    const rest       = endValue.length - 1 + (endValue.length - startValue.length > 0 ? 0 : 1);
                    const quantifier = rest == 1 ? "" : `{${rest}}`;

                    patterns.push("|", `${endSign}[1-${leadingEndDigit - 1}]\\d${quantifier}`);
                }

                if (endValue.length - startValue.length > 1)
                {
                    const rest       = endValue.length - 2;
                    const quantifier = rest == 1 ? "" : `{${rest}}`;

                    patterns.push("|", `${endSign}[1-9]\\d${quantifier}`);
                }

                console.log();
            }

            const hasSameLength  = startValue.length == endValue.length;
            const resolveLeading = startValue.length == 1
            || hasSameLength && leadingEndDigit - leadingStartDigit > 1
            || !hasSameLength && leadingStartDigit < 9;

            const limit = resolveLeading ? 0 : 1;

            for (let i = startValue.length - 1; i >= limit; i--)
            {
                const leadingStart = startValue.substring(0, i);
                const leadingEnd   = hasSameLength ? endValue.substring(0, i) : "";

                let startPattern = startSign;

                const startDigit = Number(startValue[i]);
                const endDigit   = Number(endValue[i]);
                const rest       = startValue.length - i - 1;

                if (leadingStart && leadingEnd == leadingStart)
                {
                    const startRange = startDigit;
                    const endRange   = endDigit - 1;
                    const rest       = startValue.length - i - 1;

                    if (endRange > startRange)
                    {
                        startPattern += leadingStart + this.createRange(startDigit, endRange) + this.createRange(0, 9, rest);

                        patterns.push("|", startPattern);
                    }

                    break;
                }
                else
                {
                    startPattern += `${startValue.substring(0, i)}`;

                    if (startDigit == 9 && i == startValue.length - 1)
                    {
                        startPattern += "9";
                    }
                    else
                    {
                        const startRange = startDigit + (rest == 0 ? 0 : 1);
                        const endRange   = i == limit && hasSameLength && endDigit > 1 ? endDigit - 1 : 9;

                        startPattern += this.createRange(startRange, endRange);
                    }
                }

                if (rest > 0)
                {
                    startPattern += "\\d";

                    if (rest > 1)
                    {
                        startPattern += `{${rest}}`;
                    }
                }

                patterns.push("|", startPattern);
            }
        }

        return patterns;
    }

    private scanBraceExpand(): void
    {
        const end = this.lookahead("}");

        if (end)
        {
            this.tokens.push(GROUPS["@"].open);
            this.advance();

            let isOptional = false;

            while (this.index < end)
            {
                const segmentEnd = Math.min(this.lookahead(",") ?? end, end);

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

        const minLength = Math.max(getMinLength(startRange), getMinLength(endRange));

        const parsedStartRange = Number(startRange);
        const parsedEndRange   = Number(endRange);

        const start = Math.min(parsedStartRange, parsedEndRange);
        const end   = Math.max(parsedStartRange, parsedEndRange);

        const inSimpleRange = (value: number): boolean => value >= 0 && value <= 9;

        if (multiplier == 1)
        {
            if (inSimpleRange(start) && inSimpleRange(end))
            {
                if (minLength > 1)
                {
                    this.tokens.push("0".repeat(minLength - 1));
                }

                this.tokens.push("[");
                this.tokens.push(start.toString(), "-", end.toString());
                this.tokens.push("]");
            }
            else if (start >= 0 && end > 0)
            {
                this.tokens.push(...this.parseRange(start, end, minLength));
            }
            else if (start < 0 && end <= 0)
            {
                this.tokens.push(...this.parseRange(end, start, minLength));
            }
            else if (end >= 0)
            {
                this.tokens.push(...this.parseRange(0, start, minLength));
                this.tokens.push("|");
                this.tokens.push(...this.parseRange(0, end, minLength));
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
                this.tokens.push(i.toString().padStart(minLength, "0"));

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
        const end = this.lookahead(")", index => !!this.patternList?.end && index < this.patternList.end);

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
