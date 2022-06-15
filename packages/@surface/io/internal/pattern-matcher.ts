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

type RangeValue =
{
    ceiling: string,
    value:   string,
};

type RangeInfo =
{
    start:        RangeValue,
    end:          RangeValue,
    sign:         string,
    intersection: number | null,
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

    private createRange(min: number, max: number, minQuantifier: number = 1, maxQuantifier: number = 0): string
    {
        if (minQuantifier + maxQuantifier == 0)
        {
            return "";
        }

        const range = min == max
            ? String(max)
            : min == 0 && max == 9
                ? "\\d"
                : `[${min}${max - min > 1 ? "-" : ""}${max}]`;

        const quantifier = minQuantifier < maxQuantifier
            ? minQuantifier == 0 && maxQuantifier == 1
                ? "?"
                : `{${minQuantifier},${maxQuantifier}}`
            : minQuantifier > 1
                ? `{${minQuantifier}}`
                : "";

        return range + quantifier;
    }

    private createExtendedRange(min: number, max: number, minQuantifier: number = 1, maxQuantifier: number = 0): string
    {
        return this.createRange(min, max) + this.createRange(0, 9, minQuantifier, maxQuantifier);
    }

    private getRangeInfo(start: number, end: number): RangeInfo
    {
        const startString = start.toString().replace("-", "");
        const endString   = end.toString().replace("-", "");

        let intersection: number | null = null;

        if (startString.length == endString.length)
        {
            intersection = -1;

            for (let index = 0; index < endString.length; index++)
            {
                if (startString[index] != endString[index])
                {
                    break;
                }

                intersection = index;
            }
        }

        const startValue = start.toString().replace("-", "");
        const endValue   = end.toString().replace("-", "");

        return {
            start:
            {
                ceiling: startValue[0] + "0".repeat(startValue.length - 1),
                value:   startValue,
            },
            end:
            {
                ceiling: endValue[0] + "0".repeat(endValue.length - 1),
                value:   endValue,
            },
            sign:    end < 0 ? "-" : "",
            intersection,
        };
    }

    private parseRange(start: number, end: number, _minLength: number): string[]
    {
        const patterns: string[] = [];

        const range = this.getRangeInfo(start, end);

        for (let i = range.end.value.length - 1; i > -1; i--)
        {
            if (i - 1 == range.intersection)
            {
                break;
            }

            const digit = Number(range.end.value[i]);

            if (digit == 0 && i == range.end.value.length - 1)
            {
                patterns.push(range.sign + range.end.value);
            }
            else if (i > 0 && digit > 0 || i == 0 && digit > 1)
            {
                const rest       = range.end.value.length - i - 1;
                const startRange = i == 0 ? 1 : 0;
                const endRange   = digit - (i == range.end.value.length - 1 ? 0 : 1);

                const pattern = range.sign + range.end.value.substring(0, i) + this.createExtendedRange(startRange, endRange, rest);

                if (patterns.length > 0)
                {
                    patterns.push("|");
                }

                patterns.push(pattern);
            }
        }

        if (start == 0)
        {
            const rest = range.end.value.length - 1;

            if (rest > 1)
            {
                patterns.push("|", range.sign + this.createExtendedRange(1, 9, 1, rest - 1));
            }

            if (range.sign)
            {
                patterns.push("|", range.sign + this.createRange(1, 9));
                patterns.push("|", "0");
            }
            else
            {
                patterns.push("|", this.createRange(0, 9));
            }
        }
        else if (range.start.value == range.start.ceiling && range.intersection == -1)
        {
            patterns.push("|", range.sign + this.createExtendedRange(Number(range.start.value[0]), Number(range.end.value[0]) - 1, range.start.value.length - 1));
        }
        else
        {
            const rest = range.end.value.length - range.start.value.length - 1;

            if (rest > 0)
            {
                patterns.push("|", range.sign + this.createExtendedRange(1, 9, 1, rest - 1));
            }

            for (let i = range.start.value.length - 1; i > -1; i--)
            {
                const startDigit = Number(range.start.value[i]);
                const endDigit   = Number(range.end.value[i]);

                const hasIntersected = i == range.intersection;
                const willIntersect  = i - 1 == range.intersection;

                if (hasIntersected || willIntersect && endDigit - startDigit < 2)
                {
                    break;
                }

                const isTrailingDigit = i == range.start.value.length - 1;
                const canResolveZero  = startDigit == 0 && (willIntersect || i == 1 && !isTrailingDigit);
                const canResolveNine  = startDigit == 9 && range.start.value[i + 1] == "0";

                if (startDigit == 9 && isTrailingDigit)
                {
                    if (patterns.length > 0)
                    {
                        patterns.push("|");
                    }

                    patterns.push(range.sign + range.start.value);
                }
                else if (canResolveZero || canResolveNine || startDigit > 0 && startDigit < 9)
                {
                    const rest        = range.start.value.length - i - 1;
                    const startOffset = isTrailingDigit || range.start.value[i + 1] == "0" && (i > 0 || range.start.value.length == 2) ? 0 : 1;
                    const endOffset   = isTrailingDigit ? 0 : 1;
                    const startRange  = startDigit + startOffset;
                    const endRange    = startDigit < 9 && willIntersect ? endDigit - endOffset : 9;

                    const pattern = range.sign + range.start.value.substring(0, i) + this.createExtendedRange(startRange, endRange, rest);

                    if (patterns.length > 0)
                    {
                        patterns.push("|");
                    }

                    patterns.push(pattern);
                }
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
            else
            {
                this.tokens.push(...this.parseRange(0, start, minLength));
                this.tokens.push("|");
                this.tokens.push(...this.parseRange(1, end, minLength));
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
