/* eslint-disable max-lines */
/* eslint-disable max-statements */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */

import
{
    ALPHABRACES_PATTERN,
    CHARACTERS_CLASS_MAP,
    ESCAPABLE_CHARACTERS,
    GROUPS,
    NUMBRACES_PATTERN,
    PATTERN_TOKENS as PATTERN_LIST_TOKENS,
    PATTERN_TOKENS,
    QUOTES,
    REGEX_SPECIAL_CHARACTERS,
    SEPARATORS,
} from "./characters.js";
import ContextType from "./context-type.js";
import Context     from "./context.js";

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

export type Options =
{

    /** Base path used to resolve relative patterns. */
    base?: string,

    /** Allow patterns to match dotfiles. Otherwise dotfiles are ignored unless a `.` is explicitly defined in the pattern. */
    dot?: boolean,

    /** Disables brace matching `{js,ts}, {a..z}, {0..10}`. */
    noBrace?: boolean,

    /** Perform case-insensitive matching. */
    noCase?: boolean,

    /** Disables pattern lists matching `!(..), @(..), +(..) *(..)`. */
    noExtGlob?: boolean,

    /** Disables GlobStar matching `**`.*/
    noGlobStar?: boolean,

    /** Disables negate matching. `!/foo/**` */
    noNegate?: boolean,
};

export default class Parser
{
    private readonly options: Options;

    private index: number = 0;
    private context: Context = new Context(ContextType.Literal);

    public constructor(private readonly source: string, options: Options = { })
    {
        this.options = options;
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

    private createLeadingZeros(size: number): string
    {
        switch (size)
        {
            case 0:
                return "";
            case 1:
                return "0";
            case 2:
                return "00";
            default:
                return `0{${size}}`;
        }
    }

    private createExtendedRange(min: number, max: number, minQuantifier: number = 1, maxQuantifier: number = 0): string
    {
        return this.createRange(min, max) + this.createRange(0, 9, minQuantifier, maxQuantifier);
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
            ? `{${minQuantifier},${maxQuantifier}}`
            : minQuantifier > 1
                ? `{${minQuantifier}}`
                : "";

        return range + quantifier;
    }

    private eof(): boolean
    {
        return this.index == this.source.length;
    }

    private escape(token: string): string
    {
        return REGEX_SPECIAL_CHARACTERS.has(token)
            ? `${!this.context.inside(ContextType.Class, 1) || token == "]" ? "\\" : ""}${token}`
            : token;
    }

    private getChar(length?: number): string | undefined
    {
        return length ? this.source.substring(this.index, this.index + length) : this.source[this.index];
    }

    private getNextChar(): string | undefined
    {
        return this.source[this.index + 1];
    }

    private getPreviousChar(): string | undefined
    {
        return this.source[this.index - 1];
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
                ceiling: startValue[0] + this.createLeadingZeros(startValue.length - 1),
                value:   startValue,
            },
            end:
            {
                ceiling: endValue[0] + this.createLeadingZeros(endValue.length - 1),
                value:   endValue,
            },
            sign:    end < 0 ? "-" : "",
            intersection,
        };
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

    private parseRange(start: number, end: number, minLength: number): string[]
    {
        const patterns: string[] = [];

        const range = this.getRangeInfo(start, end);

        const leading = this.createLeadingZeros(Math.max(minLength - range.end.value.length, 0));

        for (let i = range.end.value.length - 1; i > -1; i--)
        {
            if (i - 1 == range.intersection)
            {
                break;
            }

            const digit = Number(range.end.value[i]);

            if (digit == 0 && i == range.end.value.length - 1)
            {
                patterns.push(range.sign + leading + range.end.value);
            }
            else if (i > 0 && digit > 0 || i == 0 && digit > 1)
            {
                const rest       = range.end.value.length - i - 1;
                const startRange = i == 0 ? 1 : 0;
                const endRange   = digit - (i == range.end.value.length - 1 ? 0 : 1);

                const pattern = range.sign + leading + range.end.value.substring(0, i) + this.createExtendedRange(startRange, endRange, rest);

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
                if (minLength == 1)
                {
                    patterns.push("|", range.sign + this.createExtendedRange(1, 9, 1, rest - 1));
                }
                else
                {
                    for (let index = rest - 1; index > 0; index--)
                    {
                        const leading = this.createLeadingZeros(minLength - index - 1);

                        patterns.push("|", range.sign + leading + this.createExtendedRange(1, 9, index));
                    }
                }
            }

            if (range.sign)
            {
                patterns.push("|", this.createLeadingZeros(minLength - 1) + range.sign + this.createRange(1, 9));
                patterns.push("|", this.createLeadingZeros(minLength));
            }
            else
            {
                patterns.push("|", this.createLeadingZeros(minLength - 1) + this.createRange(0, 9));
            }
        }
        else if (range.start.value == range.start.ceiling && range.intersection == -1)
        {
            patterns.push("|", range.sign + this.createExtendedRange(Number(range.start.value[0]), Number(range.end.value[0]) - 1, range.start.value.length - 1));
        }
        else
        {
            const rest = range.end.value.length - range.start.value.length;

            if (rest > 1)
            {
                if (minLength == 1)
                {
                    patterns.push("|", range.sign + this.createExtendedRange(1, 9, range.start.value.length, range.end.value.length - 2));
                }
                else
                {
                    for (let index = range.end.value.length - 2; index > range.start.value.length - 1; index--)
                    {
                        const leading = this.createLeadingZeros(Math.max(minLength - index - 1, 0));

                        patterns.push("|", range.sign + leading + this.createExtendedRange(1, 9, index));
                    }
                }
            }

            const leading = this.createLeadingZeros(Math.max(minLength - range.start.value.length, 0));

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

                    patterns.push(range.sign + leading + range.start.value);
                }
                else if (canResolveZero || canResolveNine || startDigit > 0 && startDigit < 9)
                {
                    const rest        = range.start.value.length - i - 1;
                    const startOffset = isTrailingDigit || range.start.value[i + 1] == "0" && (i > 0 || range.start.value.length == 2) ? 0 : 1;
                    const endOffset   = isTrailingDigit ? 0 : 1;
                    const startRange  = startDigit + startOffset;
                    const endRange    = startDigit < 9 && willIntersect ? endDigit - endOffset : 9;

                    const pattern = range.sign + leading + range.start.value.substring(0, i) + this.createExtendedRange(startRange, endRange, rest);

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

    private parseSteppedRange(start: number, end: number, multiplier: number, minLength: number): string[]
    {
        const positives: string[] = [];
        const negatives: string[] = [];

        for (let i = start; i <= end; i += multiplier)
        {
            const patterns = i >= 0 ? positives : negatives;

            if (patterns.length > 0)
            {
                patterns.push("|");
            }

            const value = Math.abs(i).toString();

            if (value == "0")
            {
                patterns.push(this.createLeadingZeros(minLength));
            }
            else
            {
                patterns.push(this.createLeadingZeros(Math.max(minLength - value.length, 0)) + value);
            }
        }

        if (negatives.length > 0)
        {
            return ["-(?:", ...negatives, ")", "|", ...positives];
        }

        return negatives.concat(positives);
    }

    private scanAlphaRange(startChar: string, endChar: string, multiplier: number): void
    {
        const startRange = startChar.charCodeAt(0);
        const endRange   = endChar.charCodeAt(0);

        if (multiplier != 0)
        {
            this.context.push("[");

            const isValidRange = startRange < endRange
                && (
                    startChar == startChar.toLowerCase() && endChar == endChar.toLowerCase()
                    || startChar == startChar.toUpperCase() && endChar == endChar.toUpperCase()
                );

            if (multiplier == 1 && isValidRange)
            {
                this.context.push(`${String.fromCharCode(startRange)}-${String.fromCharCode(endRange)}`);
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
                            this.context.push("\\");
                        }

                        this.context.push(char);
                    }
                }
            }

            this.context.push("]");
        }
    }

    private scanBraces(): void
    {
        this.context = new Context(ContextType.Braces, this.context);

        const group = GROUPS["{"];

        this.context.push(group.open, this.escape("{"));

        this.advance();

        const start = this.index;

        let segments   = 0;
        let isOptional = false;

        while (!this.eof())
        {
            segments++;

            this.scanPattern();

            const char = this.getChar();

            if (char == ",")
            {
                const previous = this.getPreviousChar();

                const isEmpty = previous == "{" || previous == char;

                if (!isOptional)
                {
                    isOptional = isEmpty;
                }

                if (!isEmpty)
                {
                    this.context.push("|", char);
                }

                this.advance();
            }
            else
            {
                break;
            }
        }

        if (this.getChar() == "}")
        {
            const end = this.index;

            if (segments > 1)
            {
                this.context.push(group.close + (isOptional ? "?" : ""));

                this.advance();
            }
            else
            {
                const segment = this.source.substring(start, end);

                const alphaMatch = ALPHABRACES_PATTERN.exec(segment);
                const digitMatch = NUMBRACES_PATTERN.exec(segment);

                if (alphaMatch || digitMatch)
                {
                    this.context.discard();

                    this.context.push(group.open);

                    if (alphaMatch)
                    {
                        this.scanAlphaRange(alphaMatch[1]!, alphaMatch[2]!, Number(alphaMatch[3] ?? "1"));
                    }
                    else if (digitMatch)
                    {
                        this.scanNumericRange(digitMatch[1]!, digitMatch[2]!, Number(digitMatch[3] ?? "1"));
                    }

                    this.context.push(group.close);

                    this.advance();
                }
                else
                {
                    this.context.rollback();
                }
            }
        }
        else
        {
            this.context.rollback();
        }

        if (!this.context.rolledBack)
        {
            let parent = this.context.parent;

            while (parent && parent.type != ContextType.Literal)
            {
                if (parent.type != ContextType.Braces)
                {
                    parent.rollback();
                }

                parent = parent.parent;
            }
        }

        this.context = this.context.parent!;
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

                    this.context.push(characterClass);

                    return;
                }
            }
        }

        this.context = new Context(ContextType.Class, this.context);

        const group = GROUPS["["];

        this.context.push(group.open, "\\[");

        this.advance();

        const char = this.getChar();

        if ((char == "^" || char == "!") && this.context.type == ContextType.Class && this.getPreviousChar() == "[")
        {
            this.context.push("^", this.escape(char));
            this.advance();
        }

        this.scanPattern();

        if (!this.context.rolledBack && this.getChar() == "]")
        {
            this.context.push(group.close);

            this.context.children.forEach(x => x.rollback(true));

            this.advance();
        }
        else
        {
            this.context.rollback();
        }

        this.context = this.context.parent!;
    }

    private scanEscaped(): void
    {
        this.context.push(this.escape(this.getNextChar()!));

        this.advance(2);
    }

    private scanLiteral(): void
    {
        const char = this.getChar()!;

        this.context.push(this.escape(char));

        this.advance();
    }

    private scanNumericRange(startRange: string, endRange: string, multiplier: number): void
    {
        const getMinLength = (value: string): number =>
        {
            const abs = value.replace("-", "");

            return abs.startsWith("0") ? abs.length : 1;
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
                    this.context.push(this.createLeadingZeros(minLength - 1));
                }

                this.context.push("[");
                this.context.push(`${start.toString()}-${end.toString()}`);
                this.context.push("]");
            }
            else if (start >= 0 && end > 0)
            {
                this.context.push(this.parseRange(start, end, minLength).join(""));
            }
            else if (start < 0 && end <= 0)
            {
                this.context.push(this.parseRange(end, start, minLength).join(""));
            }
            else
            {
                this.context.push(this.parseRange(0, start, minLength).join(""));
                this.context.push("|");
                this.context.push(this.parseRange(1, end, minLength).join(""));
            }
        }
        else if (inSimpleRange(start) && inSimpleRange(end))
        {
            this.context.push(this.createLeadingZeros(minLength - 1));

            this.context.push("[");

            for (let i = start; i <= end; i += multiplier)
            {
                this.context.push(i.toString());
            }

            this.context.push("]");
        }
        else
        {
            this.context.push(this.parseSteppedRange(start, end, multiplier, minLength).join(""));
        }
    }

    private scanNegation(): void
    {
        this.context = new Context(ContextType.Negation, this.context);

        const group = GROUPS[`!${this.options.dot ? "." : ""}` as keyof typeof GROUPS];

        this.context.push(group.open, "");

        if (this.getNextChar() == "(")
        {
            this.scanPatternList();
        }
        else
        {
            this.advance();
            this.scanPattern();
        }

        if (!this.context.rolledBack)
        {
            this.context.push(group.close);
        }

        this.context = this.context.parent!;
    }

    private scanQuotes(): void
    {
        const quote = this.getChar()!;

        this.advance();

        const end = this.lookahead(quote);

        if (end)
        {
            while (this.index < end && !this.eof())
            {
                if (this.getChar() == "\\")
                {
                    this.advance();
                }

                this.scanLiteral();
            }

            this.advance();
        }
        else
        {
            this.context.tokens.push(quote);
        }
    }

    private scanPattern(): void
    {
        while (!this.eof())
        {
            const char = this.getChar()!;

            const shouldStop =
               char == ","  && this.context.type == ContextType.Braces
            || char == "}"  && this.context.inside(ContextType.Braces)
            || char == "|"  && this.context.type == ContextType.PatternList
            || char == ")"  && this.context.inside(ContextType.PatternList)
            || char == "]"  && !(this.getPreviousChar() == "[" && this.getNextChar() == "]") && this.context.inside(ContextType.Class);

            if (shouldStop)
            {
                return;
            }

            if (QUOTES.has(char))
            {
                this.scanQuotes();
            }
            else if (char == "\\")
            {
                this.scanEscaped();
            }
            else if (char == "/")
            {
                this.scanSlash();
            }
            else if (char == "{" && !this.options.noBrace)
            {
                this.scanBraces();
            }
            else if (!this.options.noNegate && this.index == 0 && char == "!")
            {
                this.scanNegation();
            }
            else if (!this.options.noExtGlob && PATTERN_LIST_TOKENS.has(char) && this.getNextChar() == "(")
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
            else if (char == "[" && this.context.type != ContextType.Class)
            {
                this.scanClasses();
            }
            else
            {
                this.scanLiteral();
            }
        }
    }

    private scanPatternList(): void
    {
        const start = this.index;
        this.context = new Context(ContextType.PatternList, this.context);

        const char  = this.getChar();
        const group = GROUPS[`${char}(` as keyof typeof GROUPS];

        this.context.push(group.open, char + this.escape("("));

        this.advance(2);

        while (!this.eof())
        {
            this.scanPattern();

            const char = this.getChar();

            if (char == "|")
            {
                this.context.push(char, this.escape(char));
                this.advance();
            }
            else
            {
                break;
            }
        }

        if (!this.context.rolledBack && this.getChar() == ")")
        {
            this.advance();

            this.context.tokens.push(group.close);

            if (start == 0 && char == "!" && this.context.parent?.type == ContextType.Negation)
            {
                this.context.parent.rollback();
            }
        }
        else
        {
            this.context.rollback();
        }

        this.context = this.context.parent!;
    }

    private scanPlaceholder(): void
    {
        const pattern = `[^${this.options.dot ? "" : "."}\\/\\\\]`;

        this.context.type == ContextType.Class
            ? this.context.push("?", pattern)
            : this.context.push(pattern);

        this.advance();
    }

    private scanSlash(): void
    {
        this.context.type == ContextType.Class
            ? this.context.push("\\/\\\\", "[\\/\\\\]")
            : this.context.push("[\\/\\\\]");

        this.advance();
    }

    private scanStar(): void
    {
        let stars = 0;

        const canUseGlobStar = this.index == 0 || SEPARATORS.has(this.source[this.index - 1]!);

        while (this.getChar() == "*")
        {
            this.advance();

            stars++;
        }

        if (canUseGlobStar && !this.options.noGlobStar && stars == 2)
        {
            const pattern = this.options.dot
                ? "(?!\\.\\.?[\\/\\\\]).*[\\/\\\\]?"
                : "(?:[^.\\/\\\\][^\\/\\\\]*[\\/\\\\]?)*";

            this.context.type == ContextType.Class
                ? this.context.push("*", pattern)
                : this.context.push(pattern);

            if (SEPARATORS.has(this.getChar()!))
            {
                this.advance();
            }
        }
        else
        {
            const pattern = `${!this.options.dot && canUseGlobStar ? "[^.\\/\\\\]" : ""}[^\\/\\\\]*`;

            this.context.type == ContextType.Class
                ? this.context.push("*", pattern)
                : this.context.push(pattern);
        }
    }

    public parse(): RegExp
    {
        this.scanPattern();

        return new RegExp(`^${this.context.tokens.join("")}$`, this.options.noCase ? "i" : "");
    }

    public split(): { path: string, pattern: string }
    {
        let negated = false;

        if (this.source.startsWith("!") && (this.source[1] != "(" || !this.lookahead(")", () => false)))
        {
            negated = true;

            this.advance();
        }

        const start = this.index;
        let   end   = start;

        if (SEPARATORS.has(this.getChar()!))
        {
            this.advance();
        }

        let broken = false;

        while (!this.eof())
        {
            const char = this.getChar()!;

            if (char == "\\" && ESCAPABLE_CHARACTERS.has(this.getNextChar()!))
            {
                broken = true;
            }
            else if (SEPARATORS.has(char))
            {
                end = this.index;
            }
            else
            {
                broken = char == "?"
                    || char == "*"  && !this.options.noGlobStar
                    || char == "\"" && !!this.lookahead("\"")
                    || char == "'"  && !!this.lookahead("'")
                    || char == "["  && !!this.lookahead("]")
                    || char == "{"  && !this.options.noBrace && !!this.lookahead("}")
                    || !this.options.noExtGlob && PATTERN_TOKENS.has(char!) && (this.source[this.index + 1] == "(" && !!this.lookahead(")", () => false));

                if (broken)
                {
                    break;
                }
            }

            this.advance();
        }

        if (!broken)
        {
            end = this.source.length - (this.source.endsWith("/") ? 1 : 0);
        }

        return {
            path:    this.source.substring(start, end),
            pattern: (negated ? "!" : "") + (end == 0 ? this.source : this.source.substring(end + 1, this.source.length)),
        };
    }

}
