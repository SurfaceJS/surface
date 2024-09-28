import
{
    ALPHABRACES_PATTERN,
    CHARACTERS_CLASS_MAP,
    ESCAPABLE_CHARACTERS,
    GROUPS,
    NUMBRACES_PATTERN,
    PATTERN_TOKENS,
    QUOTES,
    REGEX_SPECIAL_CHARACTERS,
    SEPARATORS,
} from "./characters.js";
import ContextType                            from "./context-type.js";
import Context                                from "./context.js";
import { parseAlphaRange, parseNumericRange } from "./range-parser.js";

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

    private eos(): boolean
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

    private scanBraces(): void
    {
        this.context = new Context(ContextType.Braces, this.context);

        const group = GROUPS["{"];

        this.context.push(group.open, this.escape("{"));

        this.advance();

        const start = this.index;

        let segments   = 0;
        let isOptional = false;

        while (!this.eos())
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
                        this.context.push(parseAlphaRange(alphaMatch[1]!, alphaMatch[2]!, Number(alphaMatch[3] ?? "1")));
                    }
                    else if (digitMatch)
                    {
                        this.context.push(parseNumericRange(digitMatch[1]!, digitMatch[2]!, Number(digitMatch[3] ?? "1")));
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
            while (this.index < end && !this.eos())
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
        while (!this.eos())
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
            else if (!this.options.noExtGlob && PATTERN_TOKENS.has(char) && this.getNextChar() == "(")
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

        while (!this.eos())
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
                : "(?:[\\/\\\\]?[^.\\/\\\\][^\\/\\\\]*)*[\\/\\\\]?";

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

        while (!this.eos())
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
